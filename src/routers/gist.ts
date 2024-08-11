import { rm } from "node:fs/promises";
import { join } from "node:path";
import { until } from "@open-draft/until";
import { Hono } from "hono";
import { writeFile } from "write-file-safe";
import Youch from "youch";
import { executeInPool } from "../runner.js";
import {
	JsonSchema,
	fetchGist,
	getDirname,
	getErrorHtml,
	transformContent,
} from "../utils.js";

const __dirname = getDirname();

export const gistRouter = new Hono();

gistRouter.all("/gist/:gistId/:fileName", async ({ req, json, html }) => {
	const gistId = req.param("gistId");
	const fileName = req.param("fileName");
	const filePath = join(__dirname, "..", "tmp", `${gistId}.${fileName}.js`);
	const { data: gistData, error: gistFetchError } = await until(() =>
		fetchGist(gistId),
	);
	if (gistFetchError) return html(getErrorHtml({ error: gistFetchError, req }));
	if (!gistData.files)
		return html(getErrorHtml({ error: new Error("Gist not found"), req }));
	const file = gistData.files?.[fileName];
	if (!file)
		return html(getErrorHtml({ error: new Error("File not found"), req }));
	const { data: transformedContent, error: transformationError } = await until(
		() => transformContent(file),
	);
	if (transformationError)
		return html(getErrorHtml({ error: transformationError, req }));
	if (!transformedContent)
		return html(getErrorHtml({ error: new Error("No code to run"), req }));
	await writeFile(filePath, transformedContent);
	const { data: executionResult, error: executionError } = await until(() =>
		executeInPool({ filePath, req }),
	);
	await rm(filePath);
	if (executionError) return html(getErrorHtml({ error: executionError, req }));
	const bodyIsJson = JsonSchema.safeParse(executionResult).success;
	return bodyIsJson ? json(executionResult) : html(executionResult);
});
