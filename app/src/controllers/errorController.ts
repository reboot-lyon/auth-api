import { Request, Response, NextFunction } from 'express';
import { InvalidPath } from '../types';

export default class ErrorController {

    public trigger(req: Request, res: Response, next: NextFunction): void {
        next(InvalidPath(req.method));
    };

    public hanlder(err: any, req: Request, res: Response, next: NextFunction): void {
        err.status = err.status || 500;
        res.status(err.status).json({
            error: {
                name: err.name,
                message: err.message,
                status: err.status,
            }
        })
    }
}