/* eslint-disable prettier/prettier */
// src/holiday/holiday.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { Holiday } from 'src/database/entities/holiday.entity';

@Controller('holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  // Import holidays from an external JSON
  @Post('seed')
  async importHolidays(): Promise<{ message: string }> {
    await this.holidayService.seedHolidays();
    return { message: 'Holidays imported successfully' };
  }


  @Get('')
  async getHolidays(): Promise<Holiday[]> {
    return this.holidayService.getHolidays();
  }

 
}
