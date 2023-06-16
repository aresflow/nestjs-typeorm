/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

      return user;

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login ( loginUserDto: LoginUserDto ) {
      const { email, password } = loginUserDto;

      const user = await this.userRepository.findOne({ 
        where: { email },
        select: { email: true, password: true }
       });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials (email)');
      }

      if (!bcrypt.compareSync(password, user.password)) { //COMPARA LA PASSWORD QUE INGRESA EL USER CON LA QUE ESTA EN LA BASE DE DATOS
        throw new UnauthorizedException('Invalid credentials (password)');
      }
      return user;
  }

  private handleDBErrors( error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
