/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
//CON PRELOAD LE DECIMOS QUE BUSQUE UN PRODUCTO POR ID Y QUE LUEGO AGREGUE LOS CAMBIOS QUE LE PASAMOS EN EL DTO
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: []
    });
    
    if ( !product ) throw new NotFoundException(`Product with #${id} not found`);

    try {
      await this.productRepository.save(product);
      return this.productRepository.save(product);
      
    } catch (error) {
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
}
