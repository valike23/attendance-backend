import { Body, Controller, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateLeaveRequestDto, ReviewLeaveRequestDto } from 'src/database/schemas/dtos/leave.dto';
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

  @Patch(':id/review')
  @UseGuards(PermissionsGuard)
  review(@Param('id') id: string, @Body() dto: ReviewLeaveRequestDto, @Req() req: any) {
    const admin = req.user;
    return this.leaveService.reviewLeaveRequest(id, admin._id.toString(), dto);
  }
}
