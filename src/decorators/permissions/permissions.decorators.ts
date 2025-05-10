// src/decorators/permissions/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PermissionEnum } from 'src/constants/permission.constants';

export const RequirePermissions = (permissions: PermissionEnum[]) =>
  SetMetadata('permissions', permissions);
