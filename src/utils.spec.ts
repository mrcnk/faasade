import { req } from "./__mocks__/request.js";
import { assignExtension, fetchGist, sanitizeRequest } from "./utils.js";

it("assigns a correct extension", () => {
	const result = assignExtension("mytsfile.ts");
	expect(result).toEqual("mjs");
});

it("sanitizes Hono request", async () => {
	const result = await sanitizeRequest(req);
	expect(result).toEqual({
		method: "GET",
		url: "https://example.com",
		headers: { "content-type": "application/json" },
		body: "Hello, World!",
	});
});

it("calls GitHub Gist API", async () => {
	const response = await fetchGist("f5b0305f5ded7987a4b6da15f5e35c3c");
	const files = Object.keys(response.files);
	expect(files.length).toBeGreaterThan(0);
});
