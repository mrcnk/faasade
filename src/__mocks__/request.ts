import type { HonoRequest } from "hono";

const fakeRawRequest = {
	method: "GET",
	url: "https://example.com",
	// biome-ignore lint/suspicious/noExplicitAny: for testing purposes
} as any;

// biome-ignore lint/suspicious/noExplicitAny: for testing purposes
const fakeHeader = (() => ({ "content-type": "application/json" })) as any;

export const req = {
	raw: fakeRawRequest,
	header: fakeHeader,
	text: () => Promise.resolve("Hello, World!"),
} as unknown as HonoRequest;
