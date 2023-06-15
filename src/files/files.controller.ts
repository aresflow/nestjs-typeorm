/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Param, Get, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

//HACIENDOLO DE ESTA MANERA TENEMOS CONTROL ABSOLUTO DE LO QUE SE SUBE, SE PUEDE HACER UNA VALIDACION DE QUE SEA UNA IMAGEN, QUE NO PASE DE UN TAMAÑO,
//TAMBIEN QUIEN PUEDE VERLO O NO, ETC (teniendo las imagenes en static)
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, //ESTO ES PARA QUE SE PUEDA ENVIAR EL ARCHIVO AL FRONTEND, CUIDADO AL USAR RES PORQUE SE SALTAN LOS INTERCEPTORS
    @Param('imageName') imageName: string
  ) {
  
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

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

      const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
      return {
        secureUrl
      }
    }
}
