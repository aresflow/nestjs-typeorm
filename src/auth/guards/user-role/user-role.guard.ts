/* eslint-disable prettier/prettier */
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> { //ESTO ES UN GUARD QUE SE ENCARGA DE VERIFICAR SI EL USER TIENE EL ROL DE ADMIN 
    
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler()); //OBTENEMOS LA METADATA DE LA RUTA
    
    !validRoles ? true : false; //SI NO HAY METADATA EN LA RUTA, DEVOLVEMOS TRUE
    validRoles.length === 0 ? true : false; //SI LA METADATA ESTA VACIA, DEVOLVEMOS TRUE

    const request = context.switchToHttp().getRequest(); //OBTENEMOS EL REQUEST
    const user = request.user as User; //OBTENEMOS EL USER DEL REQUEST

    if (!user) {
      throw new BadRequestException('User not found');
    }

    for (const role of user.roles) { //RECORREMOS LOS ROLES DEL USER
      if (validRoles.includes(role)) { //VERIFICAMOS SI EL ROL DEL USER ESTA INCLUIDO EN LOS ROLES VALIDOS
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role to access this route (valid roles: ${validRoles})`
    )

  }
}
