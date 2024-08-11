import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { gistRouter } from "./routers/gist.js";
import { getAllowedOrigins } from "./utils.js";

const app = new Hono();

app.use(logger());
app.use("*", async (c, next) => {
	const origin = getAllowedOrigins();
	const corsMiddlewareHandler = cors({
		origin,
	});
	return corsMiddlewareHandler(c, next);
});

app.route("/", gistRouter);

serve(app);
