import "dotenv/config";
import { cleanEnv, port, str } from "envalid";

export const env = cleanEnv(process.env ,{
    PORT: port(),
    NODE_ENV: str({
        choices:["development","production","test"],
    }),
    MONGO_URI: str(),
    JWT_SECRET: str(),
    ENCRYPTION_SECRET: str(),
    REDIS_URI: str(),
});