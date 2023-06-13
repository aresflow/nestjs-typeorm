/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', { //FILE ES EL NOMBRE DEL CAMPO QUE SE VA A SUBIR, EN POSTMAN POR EJEMPLO LE MANDO FILE EN EL BODY DEL FORM-DATA
    fileFilter: fileFilter,
    // limits: { fileSize: 1000 },
    storage: diskStorage({
      destination: './static/products', //ACA SE GUARDAN LOS ARCHIVOS QUE SE SUBEN
      filename: fileNamer //ACA SE LE DA EL NOMBRE AL ARCHIVO
    })
  })) 
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {
      if ( !file ) throw new BadRequestException('Make sure that the file is an image');  //SI NO ES DEL TIPO DE ARCHIVO DECLARADO, MANDA ESTE ERROR YA QUE EN EL HELPER HICIMOS LA VALIDACION DE QUE SEA IMG

      return {
        fileName: file.originalname
      }
    }
}
