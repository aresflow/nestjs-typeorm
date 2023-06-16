/* eslint-disable prettier/prettier */
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([ User ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({  //MODULOS ASINCRONOS PARA EL JWT PARA QUE PUEDA USAR EL JWT SECRET DEL .ENV 
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ( configService: ConfigService) => {
        // console.log(' JWT SECRET', configService.get('JWT_SECRET'));
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '1h',
          }
        }
      }
    })
  ],
  exports: [ TypeOrmModule ]
})
export class AuthModule {}
