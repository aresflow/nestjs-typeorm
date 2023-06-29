/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService, //ESTO VIENE DEL JWTMODULE EXPORTADO EN EL AUTH.MODULE.TS
  ) {}

  async create(createUserDto: CreateUserDto) {
    
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10), 
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJtwToken({ id: user.id })
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login ( loginUserDto: LoginUserDto ) {
      const { email, password } = loginUserDto;

      const user = await this.userRepository.findOne({ 
        where: { email },
        select: { email: true, password: true, id: true }
       });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials (email)');
      }

      if (!bcrypt.compareSync(password, user.password)) { //COMPARA LA PASSWORD QUE INGRESA EL USER CON LA QUE ESTA EN LA BASE DE DATOS
        throw new UnauthorizedException('Invalid credentials (password)');
      }
      return {
        ...user,
        token: this.getJtwToken({ id: user.id })
      };
  }

  async checkAuthStatus( user: User ) {
    return {
      ...user,
      token: this.getJtwToken({ id: user.id })
    };
  }

  private getJtwToken( payload: JwtPayload ) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors( error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
