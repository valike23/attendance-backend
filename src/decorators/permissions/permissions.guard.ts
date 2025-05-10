import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/config';
import { PermissionEnum } from 'src/constants/permission.constants';
import { Permission } from 'src/database/entities/permission.entity';
import { AuthHelper } from 'src/helpers/auth.helper';


@Injectable()
export class PermissionsGuard implements CanActivate {


  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private adminPermissionHelper: AuthHelper
  ) { }

 async canActivate(context: ExecutionContext) {
  const requiredPermissions = this.reflector.get<PermissionEnum[]>(
    'permissions',
    context.getHandler()
  );
  if (!requiredPermissions) {
    return true;
  }

  const request = context.switchToHttp().getRequest();
  const authorization = request.headers.authorization;
  if (!authorization) {
    return false;
  }

  const token = authorization.split(' ')[1];
  console.log(token);
  const user = this.jwtService.verify(token, {
    secret: config.GENERAL.secret,
  });

  request.user = user; // ✅ Attach user to request here

  console.log("we have a user", user);

  const userPermissions = await this.adminPermissionHelper.getEffectivePermissions(user);
  const userPermissionNames = userPermissions.map((p) =>
    typeof p === 'string' ? p : p.name
  );

  const isPermitted = requiredPermissions.some((p) =>
    userPermissionNames.includes(p)
  );
  if (!isPermitted) {
    throw new ForbiddenException('You do not have permission to view this resource.');
  }

  return true;
}

}

