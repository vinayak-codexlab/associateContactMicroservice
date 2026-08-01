import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/routes.js";
import { registerSwaggerDocs } from "./swagger.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

routes(app);
registerSwaggerDocs(app);

app.use(errorHandler);

export default app;

