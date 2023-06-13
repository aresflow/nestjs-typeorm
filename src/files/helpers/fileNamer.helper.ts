/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

import { v4 as uuid } from 'uuid';

export const fileNamer = ( //ESTA FUNCION SE ENCARGA DE DARLE EL NOMBRE AL ARCHIVO
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
    if ( !file ) return callback( new Error ('File is empty'), false); //SI NO HAY ARCHIVO, RETORNA UN ERROR

    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${ uuid() }.${fileExtension}`

    callback(null, fileName);
};
