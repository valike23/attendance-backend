/* eslint-disable prettier/prettier */
// holiday.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { config } from 'src/config';
import { Holiday } from 'src/database/entities/holiday.entity';
import { TCalendericResp } from 'src/database/types/holiday.types';

const {CALENDARFIC} = config

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,
  ) {}

  async seedHolidays(): Promise<void> {
   const resp = await axios.get<TCalendericResp>(`${CALENDARFIC.url}?api_key=${CALENDARFIC.key}&country=NG&year=2025`);

   const holidays: Partial<Holiday>[] = resp.data.response.holidays.map((h) => ({
    name: h.name,
    description: h.description,
    date: h.date.iso.split('T')[0], // remove time if present
    urlId: h.urlId,
    type: h.primary_type,
  }));

    await this.holidayRepo.insert(holidays); 
  }

  async getHolidays(): Promise<Holiday[]> {
    return this.holidayRepo.find();
  }
}
