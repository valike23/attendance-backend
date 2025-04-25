import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OfficeService } from './office.service';
import { CreateOfficeDto, OfficeWithUsersDto } from 'src/database/schemas/dtos/office.dto';

@Controller('office')
export class OfficeController {
  constructor(
    private readonly officeService: OfficeService,
  ) { }
  @Get()
  findAll() {

    return this.officeService.getAllOffices();
  }

  @Post()
  createOffice(@Body() body: CreateOfficeDto) {
    return this.officeService.createOffice(body);
  }

  @Get(':id')
  async getOfficeWithUsers(@Param('id') id: string): Promise<OfficeWithUsersDto> {
    return this.officeService.getOfficeWithUsers(id);
  }

}
