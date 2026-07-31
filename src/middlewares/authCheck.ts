import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import {env} from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const Protect = (req:Request, res:Response, next:NextFunction)=>{
    // const authHeader = req.headers.authorization;
    const rawToken = req.cookies?.accessToken || req.cookies?.token;
    if(!rawToken){
        return next(new ApiError(401, "Authentication Failed !"));
    }
    const accessToken = rawToken.startsWith("Bearer ")
        ? rawToken.split(" ")[1]
        : rawToken;

    if (!accessToken) {
        return next(new ApiError(401, "Authentication Failed !"));
    }
    try{
        const decoded = jwt.verify(accessToken, env.JWT_SECRET) as {brokerId: string, firmId:string};
        req.user = decoded;
        next();
    } catch{
        next(new ApiError(401, "Authentication Failed !"));
    }
};