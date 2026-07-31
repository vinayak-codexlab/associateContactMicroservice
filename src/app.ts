import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import router from "./routes/contactAssociation.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(router);

app.use(errorHandler);

export default app;

