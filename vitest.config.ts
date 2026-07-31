import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        env: {
            PORT: "3000",
            NODE_ENV: "test",
            MONGO_URI: "mongodb://localhost:27017/contact-association-test",
            JWT_SECRET: "test-jwt-secret",
            ENCRYPTION_SECRET: "test-encryption-secret",
        },
    },
});
