/* eslint-disable prettier/prettier */
import { PassportStrategy } from "@nestjs/passport";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'), //secret key para validar el token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // ignoreExpiration: false, //Si el token expiro o no
        });
    }

    async validate(payload: JwtPayload): Promise<User> { //Validar el token

        //IR A LA BASE DE DATOS, VER SI EXISTE EL DATO QUE QUIERO VALIDAR EN EL TOKEN Y DEVOLVERLO
        const { id } = payload;

        const user = await this.userRepository.findOneBy({id});

        if (!user) {
            throw new UnauthorizedException('Token not valid');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User is not active');
        }

        return user; //Si el token es valido, devuelvo el usuario y esto se guarda en el Request y se puede usar en los controladores
    }               //donde tenga acceso a la Request voy a tener acceso al usuario devuelto aca
}