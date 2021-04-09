import jwt from 'express-jwt';
import guard from 'express-jwt-permissions';
import { Request, Response, NextFunction } from 'express';
import { PUB_KEY } from '../config';

export class AuthController {

    public tokenHandler: jwt.RequestHandler = jwt({
        secret: PUB_KEY,
        algorithms: ['RS256'],
        credentialsRequired: true,
        requestProperty: 'body.user',
        getToken: (req: Request) => {
            return (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer' ? req.headers.authorization.split(' ')[1] : null );
        }
    })

    public tokenOptionalHandler: jwt.RequestHandler = jwt({
        secret: PUB_KEY,
        algorithms: ['RS256'],
        credentialsRequired: false,
        requestProperty: 'body.user',
        getToken: (req: Request) => {
            return (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer' ? req.headers.authorization.split(' ')[1] : null );
        }
    })

    public guardHandler = guard({
        permissionsProperty: 'scope'
    })

    public authHandler(req: Request, res: Response, next: NextFunction) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Basic') {
            req.body.user = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('ascii');
        }
        next();
    }
};