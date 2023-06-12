/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductsModule } from './products.module';

import { Product, ProductImage } from './entities';
@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService'); //CON ESTO PODEMOS VER LOS ERRORES EN LA CONSOLA
  
  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,  //ESTO SABE LA CADENA DE DATOS QUE USO PARA CONECTARME A LA BASE DE DATOS

  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
      images: images.map(image => this.productImageRepository.create({ url: image }))
      });

      await this.productRepository.save(product);

      return {...product, images};
  
    } catch (error) {
      this.handleException(error);
    }
    
  }

  //PAGINAR
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    })

    return products.map(product => ({
      ...products,
      images: product.images.map(image => image.url)
    }));
  }

  //CON ESTO BUSCO POR ID O SLUG Y ME TRAE EL PRODUCTO
  async findOne(term: string) {
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug', {  //CON =: SE LE PASA EL PARAMETRO A LA QUERY PARA QUE NO SE HAGA SQL INJECTION 
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images', 'prodImages')  //CON ESTO TRAEMOS LAS IMAGENES DEL PRODUCTO
      .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with #${term} not found`);
    }

    return product;
  }

  //CON findOnePlain BUSCO POR ID O SLUG Y ME TRAE EL PRODUCTO CON LAS IMAGENES Y COMO YO QUIERO QUE VENGA
  async findOnePlain ( term: string ) {
    const { images = [], ...product } = await this.findOne(term);
    return { 
      ...product, 
      images: images.map(image => image.url) 
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

//CON PRELOAD LE DECIMOS QUE BUSQUE UN PRODUCTO POR ID Y QUE LUEGO AGREGUE LOS CAMBIOS QUE LE PASAMOS EN EL DTO
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
    
    if ( !product ) throw new NotFoundException(`Product with #${id} not found`);

    //CREATE QUERY RUNNER (ESPERA A QUE SE EJECUTE LA QUERY PARA SEGUIR CON EL CODIGO, SI NO SE EJECUTA NO SIGUE Y NO LLENA LA BASE DE DATOS)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {
      //BORRAMOS LAS IMAGENES QUE TIENE EL PRODUCTO
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map(image => this.productImageRepository.create({ url: image })); //CREAMOS LAS IMAGENES QUE LE PASAMOS EN EL DTO
      }

      //GUARDAMOS EL PRODUCTO
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleException(error: any) {
    if (error.code === '23505') 
      throw new BadRequestException(error.detail);

    this.logger.error(error.message);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllProducts() { //BORRA TODOS LOS PRODUCTOS DE LA BASE DE DATOS USADOS CON LA CREACION DE LA SEMILLA (SOLO PARA TEST)
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleException(error);
    }
  }
}
