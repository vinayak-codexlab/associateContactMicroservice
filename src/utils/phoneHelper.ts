import crypto from "crypto";
import { env } from "../config/env.js";

const encryption_key = crypto.createHash("sha256").update(env.ENCRYPTION_SECRET).digest();

const LENGTH = 16;
const ALGORITHM = "aes-256-cbc";

export const encryptContact = (text:string):string=>{
    if (!text) return text;
    const RANDOM_IV = crypto.randomBytes(LENGTH); //dynamic iv generating everytime
    
    const cipher = crypto.createCipheriv(ALGORITHM, encryption_key, RANDOM_IV);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return RANDOM_IV.toString("hex") + encrypted;
};
export const decryptContact = (text:string):string=>{
    try{
        if (!text) return text;
        const ivHex = text.slice(0, LENGTH * 2);
        const iv = Buffer.from(ivHex, "hex");

        if (iv.length !== LENGTH) return text;
        const encrptedText = text.slice(LENGTH * 2);

        const decipher = crypto.createDecipheriv(ALGORITHM, encryption_key, iv);
        let decrypted = decipher.update(encrptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch(err){
        return text;
    }
};
export const hashMobile = (text:string):string=>{
    try{
        if(!text) return text;
        return crypto.createHash("sha256").update(text.trim()).digest("hex");
    } catch(err){
        return "";
    }
};