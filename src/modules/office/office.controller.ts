import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OfficeService } from './office.service';
import { AddUsersToOfficeDto, CreateOfficeDto, OfficeWithUsersDto } from 'src/database/schemas/dtos/office.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { ObjectId } from 'mongodb';

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

    @Get('office-attendance')
async getFlatPaginatedAttendance(
  @Query('officeId') officeId: string,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('page') page = 1,
  @Query('limit') limit = 7, 
) {
  console.log("kelvin faggi")
   console.log("the office id", officeId);
let officeObjectId: ObjectId;
try {
  officeObjectId = new ObjectId(officeId);
} catch (err) {
  throw new BadRequestException('Invalid officeId');
}
  return this.attendanceService.getPaginatedFlatAttendance(
    officeObjectId,
    new Date(startDate),
    new Date(endDate),
    Number(page),
    Number(limit),
  );
}

@Get('office-attendance/export')
async exportFlatAttendance(
  @Query('officeId') officeId: string,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
) {
  let officeObjectId: ObjectId;
  try {
    officeObjectId = new ObjectId(officeId);
  } catch (err) {
    throw new BadRequestException('Invalid officeId');
  }

  return this.attendanceService.getPaginatedFlatAttendance(
    officeObjectId,
    new Date(startDate),
    new Date(endDate),
     1,
    Number.MAX_SAFE_INTEGER,
  );
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


  @Get('/:id')
  findOne(@Param('id') id: string){
    return this.officeService.getSingleOffice(id);
  }

}
