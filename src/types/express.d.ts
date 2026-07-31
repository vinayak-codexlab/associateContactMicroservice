export {};

declare global {
    namespace Express {
        interface Request{
            user?:{
                brokerId: string;
                firmId: string;
            };
        }
    }
}

//Note: This extends Express's Request type so req.user is available throughout your project with proper type safety.