/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService'); //CON ESTO PODEMOS VER LOS ERRORES EN LA CONSOLA
  
  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
  
    } catch (error) {
      this.handleException(error);
    }
    
  }

  //PAGINAR
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: relaciones
    });
  }

  //CON ESTO BUSCO POR ID O SLUG Y ME TRAE EL PRODUCTO
  async findOne(term: string) {
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug', {  //CON =: SE LE PASA EL PARAMETRO A LA QUERY PARA QUE NO SE HAGA SQL INJECTION 
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      }).getOne();
    }

    // const product = await this.productRepository.findOneBy({term});
    if (!product) {
      throw new NotFoundException(`Product with #${term} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
//CON PRELOAD LE DECIMOS QUE BUSQUE UN PRODUCTO POR ID Y QUE LUEGO AGREGUE LOS CAMBIOS QUE LE PASAMOS EN EL DTO
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
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
