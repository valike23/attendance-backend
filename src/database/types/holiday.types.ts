/* eslint-disable prettier/prettier */
import { HolidayType } from "../entities/holiday.entity";

/* eslint-disable prettier/prettier */
type CountryType  = {
    id: string; // ISO 3166-1 alpha-2 code (e.g., "US", "GB", "DE")
    name: string; // Full country name (e.g., "United States", "Germany")
}
type DateType = {
    iso: string; // ISO format: "2025-12-25"
    datetime: {
        year: number;
        month: number;
        day: number;
        hour?: number;
        minute?: number;
        second?: number;
    };
}
type Holiday = {
        name: string; // ISO format: "2025-12-25"
        description: string;
        country: CountryType; // Country object containing id and name
        date: DateType; // Date object containing iso and datetime
        type: HolidayType[]; // Type of holiday (e.g., "Public Holiday", "Observance", "Season")
        primary_type: HolidayType; // Primary type of the holiday (e.g., "Public Holiday", "Observance", "Season")
        urlId: string; // Unique identifier for the holiday
        
}
export type TCalendericResp = {
  meta: {
    code: number;
  };
  response: {
    holidays: Holiday[];
  };
};
