/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkersService {
  constructor() {}

  async updateHolidays() {
    console.log('Updating holidays...');
  }
}
