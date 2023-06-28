/* eslint-disable prettier/prettier */
import { ExecutionContext, createParamDecorator } from "@nestjs/common";


export const RawHeaders = createParamDecorator( //ESTE DECORADOR SE ENCARGA DE OBTENER EL USER DEL REQUEST
    (data: string, ctx: ExecutionContext ) => {
        
        const request = ctx.switchToHttp().getRequest(); //OBTENEMOS EL REQUEST DEL CONTEXTO
        return request.rawHeaders; 

    }
);