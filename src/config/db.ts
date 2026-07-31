import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import {env} from "./env.js";
import mongoose from "mongoose";

export const connectDB = async()=>{
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log("DB Connected");
    } catch(err){
        console.log("Error in the db connection", err);
        process.exit(1);
    }
};