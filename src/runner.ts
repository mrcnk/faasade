import type { HonoRequest } from "hono";
import Tinypool from "tinypool";
import { sanitizeRequest } from "./utils.js";

export const executeInPool = async ({
	filePath,
	req,
}: {
	filePath: string;
	req: HonoRequest;
}): Promise<string> => {
	const pool = new Tinypool({ filename: filePath });
	const sanitizedReq = await sanitizeRequest(req);
	const result = await pool.run({ req: sanitizedReq });
	await pool.destroy();
	return result;
};
