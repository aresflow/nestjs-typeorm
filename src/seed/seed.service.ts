/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService, //ESTO PUEDO USARLO PORQUE EXPORTAMOS EL PRODUCTSMODULE DESDE EL .MODULE.TS DE PRODUCTS
  
    @InjectRepository( User )
    private readonly userRepository: Repository<User>
    ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);  //CON ESTO ELIMINAMOS TODOS LOS PRODUCTOS DE LA BASE DE DATOS LLAMANDO A API/SEED
    return 'SEED EXECUTED'
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute(); //ESTO ELIMINA TODOS LOS USUARIOS DE LA BASE DE DATOS
  }
  
  private async insertUsers() { //CON ESTO INSERTAMOS LOS USUARIOS DE LA BASE DE DATOS LLAMANDO A API/SEED

    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0]; //SI ACA MANDABAMOS EL users[0] NO FUNCIONABA PORQUE NO TENIA EL ID QUE SE GENERA EN LA BASE DE DATOS
  }

  private async insertNewProducts( user: User ) {  //CON ESTO INSERTAMOS LOS PRODUCTOS DE LA BASE DE DATOS LLAMANDO A API/SEED
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises); //ESTO ES PARA QUE SE EJECUTEN TODAS LAS PROMESAS A LA VEZ
    return true;
  }
}
