import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateLeaveRequestDto, PaginatedLeavesDto, ReviewLeaveRequestDto } from 'src/database/schemas/dtos/leave.dto';
import { LeaveService } from './leave.service';
import { PermissionsGuard } from 'src/decorators/permissions/permissions.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('leave')
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService
  ) {

  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  apply(@Body() dto: CreateLeaveRequestDto, @Req() req: any) {
    console.log(req.user);
    const { user } = req;
    return this.leaveService.applyForLeave(user.userId, dto);
  }

   @Get('summary')
  @UseGuards(AuthGuard('jwt'))
  summary( @Req() req: any) {
   
    const { user } = req;
    return this.leaveService.getDashboardStats(user.userId);
  }

  @Patch(':id/review')
  @UseGuards(PermissionsGuard)
  review(@Param('id') id: string, @Body() dto: ReviewLeaveRequestDto, @Req() req: any) {
    const admin = req.user;
    return this.leaveService.reviewLeaveRequest(id, admin._id.toString(), dto);
  }

   @UseGuards(AuthGuard('jwt'))
  @Get()
  async findMyLeaves(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedLeavesDto> {
    
    const { user } = req;
    return this.leaveService.getLeavesByUser(user.userId, page, limit);
  }
}
