import { ConfigType } from "./types";
import dotenv from "dotenv";
dotenv.config();
const {MONGO_URL, MONGO_DB_NAME, PORT, NODE_ENV} = process.env;

export const config: ConfigType = {
    MONGO: {
        url: MONGO_URL || "mongodb://localhost:27017",
        dbName: MONGO_DB_NAME || "mydb",
    },
    GENERAL: {
        port: Number(PORT) || 3000,
        env: NODE_ENV || "development",
    }
}