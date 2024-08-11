import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import type { HonoRequest } from "hono";
import { ofetch } from "ofetch";
import { P, match } from "ts-pattern";
import Youch from "youch";
import { z } from "zod";
import type { GistFile, GitHubGist } from "./types.js";

const LiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof LiteralSchema>;
type Json = Literal | { [key: string]: Json } | Json[];

export const JsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([LiteralSchema, z.array(JsonSchema), z.record(JsonSchema)]),
);

export const fetchGist = async (gistId: string) => {
	return ofetch<GitHubGist>(`https://api.github.com/gists/${gistId}`);
};

export const sanitizeRequest = async (req: HonoRequest) => {
	return {
		method: req.raw.method,
		url: req.raw.url,
		headers: req.header(),
		body: await req.text(),
	};
};

export const getDirname = () => {
	const __filename = fileURLToPath(import.meta.url);
	return dirname(__filename);
};

export const transformContent = (file: GistFile) => {
	return match(file)
		.with({ language: "JavaScript" }, ({ content }) => Promise.resolve(content))
		.with(
			{ language: "TypeScript" },
			async ({ content }) =>
				(
					await transform(content, {
						loader: "ts",
						format: "esm",
					})
				).code,
		)
		.exhaustive();
};

export const assignExtension = (fileName: string) => {
	return match(fileName)
		.with(P.string.endsWith(".ts"), () => "mjs")
		.with(P.string.endsWith(".mjs"), () => "mjs")
		.with(P.string.endsWith(".cjs"), () => "cjs")
		.with(P.string.endsWith(".js"), () => "mjs")
		.run();
};

export const getErrorHtml = ({
	error,
	req,
}: {
	error: unknown;
	req: HonoRequest;
}) => {
	const youch = new Youch(error, req);
	return youch.toHTML();
};
