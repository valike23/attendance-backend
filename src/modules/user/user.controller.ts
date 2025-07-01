/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AssignPermissionDto, CreatePermissionDto, CreateRoleDto, LoginDto } from 'src/database/schemas/dtos/login.dto';
import { UserService } from './user.service';
import { RolesService } from './role.service';
import { PermissionService } from './permission.service';
import { PermissionEnum } from 'src/constants/permission.constants';
import { PermissionsGuard } from 'src/decorators/permissions/permissions.guard';
import { RequirePermissions } from 'src/decorators/permissions/permissions.decorators';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly rolesService: RolesService,
        private readonly permissionsService: PermissionService
    ) { }
    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.userService.login(body.email, body.password);
    }

    @Get('all')
    async getAllUsers(){
      return this.userService.getAllUsers()
    }

    @Post('role')
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.createRole(dto);
    }

    @Get('role')
    findAllRoles() {
        return this.rolesService.getAllRoles();
    }

    @Get('role/:id')
    findOneRole(@Param('id') id: string) {
        return this.rolesService.getRoleById(id);
    }

    @UseGuards(PermissionsGuard)
  @RequirePermissions([PermissionEnum.PERMISSION_CREATE])
     @Post('permission')
  createPermission(@Body() dto: CreatePermissionDto, @Req() req: any) {
    console.log(req.user);
    return this.permissionsService.createPermission(dto);
  }

  @Get('permission')
  findAllPermission() {
    return this.permissionsService.getAllPermissions();
  }

  @Post('user/permissions')
async assignPermissions(@Body() dto: AssignPermissionDto) {
  return this.permissionsService.assignPermissionsToUser(dto.userId, dto.permissions);
}
}
