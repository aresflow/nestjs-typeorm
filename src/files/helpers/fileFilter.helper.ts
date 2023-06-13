/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
    if ( !file ) return callback( new Error ('File is empty'), false); //SI NO HAY ARCHIVO, RETORNA UN ERROR

    const fileExtension = file.mimetype.split('/')[1]; //OBTENGO LA EXTENSION DEL ARCHIVO
    const validExtensions = ['jpg', 'png', 'jpeg']; //EXTENSIONES VALIDAS

    if ( validExtensions.includes(fileExtension) ) {
        return callback(null, true); //SI LA EXTENSION DEL ARCHIVO ESTA DENTRO DE LAS VALIDAS, RETORNA TRUE
    } else {
        callback(null, false); //SI PONGO FALSE, NO ME DEJA SUBIR EL ARCHIVO Y ME TIRA UN ERROR
    }
};
