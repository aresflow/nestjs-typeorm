/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
    
    @IsOptional()
    @IsPositive()
    @Type(() => Number)    //Transformar porque en el query llega como string
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type(() => Number)    //Transformar porque en el query llega como string
    offset?: number;
}