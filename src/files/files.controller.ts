/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file')) //FILE ES EL NOMBRE DEL CAMPO QUE SE VA A SUBIR, EN POSTMAN POR EJEMPLO LE MANDO FILE EN EL BODY DEL FORM-DATA
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {
      return file;
    }
}
