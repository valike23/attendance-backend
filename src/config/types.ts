/* eslint-disable prettier/prettier */
export class ConfigType {
  MONGO: { url: string; dbName: string };
  GENERAL: { port: number; env: string, secret: string };
  CALENDARFIC: { key: string, url: string };
  GWXPRO: {url: string}
}
