/* eslint-disable prettier/prettier */
import { ConfigType } from "./types";
import 'dotenv/config';
const {MONGO_URL, MONGO_DB_NAME, CALENDARFIC_KEY,
    PORT, NODE_ENV,CALENDERIC_URL} = process.env;

export const config: ConfigType = {
    MONGO: {
        url: MONGO_URL || "mongodb://localhost:27017",
        dbName: MONGO_DB_NAME || "mydb",
    },
    GENERAL: {
        port: Number(PORT) || 3000,
        env: NODE_ENV || "development",
    },
    CALENDARFIC: {
        key: CALENDARFIC_KEY || '',
        url: CALENDERIC_URL || ''
    }
}