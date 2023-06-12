/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]) 
  ],
  exports: [
    ProductsService,  //LO EXPORTAMOS PARA QUE CUALQUIERA QUE IMPORTE PRODUCTSMODULE PUEDA UTILIZA EL PRODUCTSSERVICE Y POR EJEMPLO ELIMINAR COSAS, COMO EN EL CASO DEL SEED.SERVICE
    TypeOrmModule
  ]
})
export class ProductsModule {}
