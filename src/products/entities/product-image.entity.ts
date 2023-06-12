/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity({ name: 'products_images'})
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    //MUCHAS IMAGENES PUEDEN TENER UN UNICO PRODUCTO
    @ManyToOne(
        () => Product, 
        (product) => product.images,
        { onDelete: 'CASCADE'}  //SI SE BORRA UN PRODUCTO, SE BORRAN TODAS SUS IMAGENES (CASCADE)
    )
    product: Product;
}