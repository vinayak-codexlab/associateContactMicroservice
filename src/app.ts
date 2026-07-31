import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

routes(app);

app.use(errorHandler);

export default app;

