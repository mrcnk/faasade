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

/**
 * Fetches a GitHub Gist using its ID.
 *
 * @param {string} gistId - The ID of the Gist to fetch.
 * @returns {Promise<GitHubGist>} The fetched Gist.
 */
export const fetchGist = async (gistId: string) => {
	return ofetch<GitHubGist>(`https://api.github.com/gists/${gistId}`);
};

/**
 * Sanitizes the request by extracting the method, url, headers, and body.
 *
 * @param {HonoRequest} req - The request to be sanitized.
 * @returns {Promise<{ method: string; url: string; headers: any; body: string; }>} The sanitized request.
 */
export const sanitizeRequest = async (req: HonoRequest) => {
	return {
		method: req.raw.method,
		url: req.raw.url,
		headers: req.header(),
		body: await req.text(),
	};
};

/**
 * Returns the directory name of the current module file.
 *
 * @returns {string} The directory name of the current module file.
 */
export const getDirname = () => {
	const __filename = fileURLToPath(import.meta.url);
	return dirname(__filename);
};

/**
 * Transforms the content of a Gist file based on its language.
 *
 * @param {GistFile} file - The Gist file whose content is to be transformed.
 * @returns {Promise<string>} The transformed content of the Gist file.
 */
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

/**
 * Assigns the extension for the given file name after transformation.
 *
 * @param {string} fileName - The name of the file.
 * @returns {string} The extension after transformation..
 */
export const assignExtension = (fileName: string) => {
	return match(fileName)
		.with(P.string.endsWith(".ts"), () => "mjs")
		.with(P.string.endsWith(".mjs"), () => "mjs")
		.with(P.string.endsWith(".cjs"), () => "cjs")
		.with(P.string.endsWith(".js"), () => "mjs")
		.run();
};

/**
 * Generates an HTML representation of an error.
 *
 * @param {{ error: unknown; req: HonoRequest; }} { error, req } - An object containing the error to be represented and the request that caused the error.
 * @returns {Promise<string>} The HTML representation of the error.
 */
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

export const getAllowedGists = () => {
	// biome-ignore lint/complexity/useLiteralKeys: Biome clashes with tsc
	const ALLOWED_GISTS = process.env?.["FAASADE_GIST_ALLOWLIST"];
	if (!ALLOWED_GISTS) return [];
	return ALLOWED_GISTS.split(",");
};

export const getAllowedOrigins = () => {
	// biome-ignore lint/complexity/useLiteralKeys: Biome clashes with tsc
	const ALLOWED_ORIGINS = process.env?.["FAASADE_CORS_ORIGIN"];
	if (!ALLOWED_ORIGINS) return "*";
	return ALLOWED_ORIGINS.split(",");
};
