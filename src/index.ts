import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ofetch } from "ofetch";
import Tinypool from "tinypool";
import { writeFile } from "write-file-safe";
import { JsonSchema } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type GitHubGist = {
	files: Record<string, { content: string }>;
};

const app = new Hono();

app.all("/run/:gistId/:fileName", async ({ req, json, html }) => {
	const gistId = req.param("gistId");
	const fileName = req.param("fileName");
	const filePath = join(__dirname, "..", "tmp", `${gistId}.${fileName}`);
	const { files } = await ofetch<GitHubGist>(
		`https://api.github.com/gists/${gistId}`,
	);
	const content = files[fileName]?.content;
	if (!content) throw new Error("File not found");
	await writeFile(filePath, content);
	const pool = new Tinypool({
		filename: filePath,
	});
	const sanitizedReq = {
		method: req.raw.method,
		url: req.raw.url,
		headers: req.header(),
		body: await req.text(),
	};
	const result = await pool.run({
		req: sanitizedReq,
	});
	await pool.destroy();
	await rm(filePath);
	const bodyIsJson = JsonSchema.safeParse(result).success;
	return bodyIsJson ? json(result) : html(result);
});

serve(app);
