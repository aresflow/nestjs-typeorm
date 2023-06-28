/* eslint-disable prettier/prettier */
import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";


export const GetUser = createParamDecorator( //ESTE DECORADOR SE ENCARGA DE OBTENER EL USER DEL REQUEST
    (data: string, ctx: ExecutionContext ) => {
        
        const request = ctx.switchToHttp().getRequest(); //OBTENEMOS EL REQUEST DEL CONTEXTO
        const user = request.user; //OBTENEMOS EL USER DEL REQUEST QUE VIENE DEL GUARD DE AUTH 

        if( !user ) {
            throw new InternalServerErrorException('User not found (request)');
        }

        return (!data ? user : user[data]); //RETORNAMOS EL USER DEL REQUEST CON TODA LA INFO DEL USUARIO
    }
);