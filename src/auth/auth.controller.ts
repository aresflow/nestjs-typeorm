/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard()) //ESTE GUARD ES EL QUE SE ENCARGA DE VALIDAR EL JWT
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User, //ESTE DECORADOR SE ENCARGA DE OBTENER EL USER DEL REQUEST 
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user']) SE PODRIA USAR DE ESTA MANERA PERO NO ES RECOMENDABLE YA QUE PODEMOS ERRARLE A LA PALABRA ROLES, POR EJ, Y PODRIA ACCEDER CUALQUIERA
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser) //ESTE DECORADOR SE ENCARGA DE LLAMAR Y VERIFICAR EL ROLE DEL USER
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
