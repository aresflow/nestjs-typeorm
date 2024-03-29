/* eslint-disable prettier/prettier */
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity({ name: 'products'})
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  //UN PRODUCTO PUEDE TENER MUCHAS IMAGENES
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true, eager: true,  //EAGER: CARGA LA RELACION DE UNA VEZ (POR DEFECTO ES LAZY) Y PODEMOS CARGAR LAS IMAGENES CUANDO CARGAMOS EL PRODUCTO
  })
  images?: ProductImage[];

  @ManyToOne(
    () => User, 
    (user) => user.product,
    {eager: true}
  )
  user: User;
  
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replace(' ', '_')
      .replace("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replace(' ', '_')
      .replace("'", '');
  }
}
