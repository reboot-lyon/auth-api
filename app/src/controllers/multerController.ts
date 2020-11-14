import multer, { Multer } from 'multer';
import { MULTER_PATH } from '../config';
import { QueryFileError } from '../types';

export const MulterImageController: Multer = multer({
    storage: multer.diskStorage({
        destination: (req: any, file: any, done: Function) : void => {
            done(null, MULTER_PATH + 'media/');
        },
        filename: (req: any, file: any, done: Function): void => {
            const uniqueSuffix: string = Date.now() + '-'+ Math.round(Math.random() * 1E9);
            done(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]); 
        }
    }),
    limits: {
        fileSize: 25000000
    },
    fileFilter: (req: any, file: any, done: Function): void => {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            return done(QueryFileError, false);
        }
        console.log(file);
        done(null, true);
    }
});

export const NoneController = multer().none();