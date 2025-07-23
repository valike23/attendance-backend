import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OfficeService } from './office.service';
import { AddUsersToOfficeDto, CreateOfficeDto, OfficeWithUsersDto } from 'src/database/schemas/dtos/office.dto';
import { AttendanceService } from '../attendance/attendance.service';

@Controller('office')
export class OfficeController {
  constructor(
    private readonly officeService: OfficeService,
    private readonly attendanceService: AttendanceService
  ) { }
  @Get()
  findAll() {

    return this.officeService.getAllOffices();
  }

  @Get('/:id')
  findOne(@Param('id') id: string){
    return this.officeService.getSingleOffice(id);
  }

  @Post()
  createOffice(@Body() body: CreateOfficeDto) {
    return this.officeService.createOffice(body);
  }


  @Put('temp')
  tempUpdate(@Body() body: CreateOfficeDto) {
    return this.officeService.createorUpdate(body);
  }

  @Get(':id')
  async getOfficeWithUsers(@Param('id') id: string): Promise<OfficeWithUsersDto> {
    return this.officeService.getOfficeWithUsers(id);
  }

  @Put(':id/add-users')
  addUsersToOffice(
    @Param('id') id: string,
    @Body() body: AddUsersToOfficeDto,
  ) {
    return this.officeService.addUsersToOffice(id, body.userIds);
  }

  @Get('office-attendance')
async getFlatPaginatedAttendance(
  @Query('officeId') officeId: string,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('page') page = 1,
  @Query('limit') limit = 7, 
) {
  return this.attendanceService.getPaginatedFlatAttendance(
    officeId,
    new Date(startDate),
    new Date(endDate),
    Number(page),
    Number(limit),
  );
}


}
