import { join } from "node:path";
import { req } from "./__mocks__/request.js";
import { executeInPool } from "./runner.js";
import { getDirname } from "./utils.js";

const __dirname = getDirname();

it("executes simple ESM function", async () => {
	const filePath = join(__dirname, "__mocks__", "simple.mjs");
	const result = await executeInPool({ filePath, req });
	expect(result).toEqual(3125);
});
