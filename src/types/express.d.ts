export {};

declare global {
    namespace Express {
        interface Request{
            user?:{
                sub: string;
                firm_id: string;
            };
        }
    }
}

//Note: This extends Express's Request type so req.user is available throughout your project with proper type safety.