import { Request, Response, NextFunction } from 'express';
import { handShake, recipLookUp } from '../utils';
import { Token } from '../models/tokenModel';
import { IResponse } from '../types';

export class QueryRevoke {
    public user: { id: string, scope: string, iat: number, exp: number } = {
        id: '',
        scope: '',
        iat: -1,
        exp: -1
    }

    public validate(): Promise<any> {
        return (new Promise((resolve: (query: any) => void, reject: (err: IResponse) => void): void => {
            recipLookUp(this.validator(), this).then((): void => {
                return (resolve(this.user.id));
            }).catch((err: IResponse): void => {
                return (reject(err));
            });
        }))
    }

    private validator(): any {
        return ({
            user: (user: { id: string, scope: string, iat: number, exp: number }) => user.id !== '' ? true : false
        });
    }
};

export class TokenController {

    public revokeHandler(req: Request, res: Response, next: NextFunction): void {
        handShake([req.body], new QueryRevoke()).then((recip: any): void => {
            Token.destroy(recip).then((status: number): void => {
                res.sendStatus(status);
            }).catch((err: IResponse): void => {
                next(err);
            });
        }).catch((err: IResponse): void => {
            next(err);
        });
    }
};