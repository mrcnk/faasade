import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { gistRouter } from "./routers/gist.js";

const app = new Hono();

app.use(logger());

app.route("/", gistRouter);

serve(app);
