import app from "./app.js";
import {env} from "./config/env.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./utils/redisHelper.js";

const startServer = async()=>{
    try {
        await connectDB();
        await connectRedis();
        app.listen(env.PORT, ()=>{
            console.log(`Server running on PORT ${env.PORT}`);
        })
    } catch(error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();