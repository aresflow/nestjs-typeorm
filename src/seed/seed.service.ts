/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService //ESTO PUEDO USARLO PORQUE EXPORTAMOS EL PRODUCTSMODULE DESDE EL .MODULE.TS DE PRODUCTS
  ) {}

  async runSeed() {
    await this.insertNewProducts();  //CON ESTO ELIMINAMOS TODOS LOS PRODUCTOS DE LA BASE DE DATOS LLAMANDO A API/SEED
    return 'SEED EXECUTED'
  }

  private async insertNewProducts() {  //CON ESTO INSERTAMOS LOS PRODUCTOS DE LA BASE DE DATOS LLAMANDO A API/SEED
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product));
    });

    await Promise.all(insertPromises); //ESTO ES PARA QUE SE EJECUTEN TODAS LAS PROMESAS A LA VEZ
    return true;
  }
}
