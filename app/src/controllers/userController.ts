import { Request, Response, NextFunction } from 'express';
import { handShake, recipLookUp } from '../utils';
import { User } from '../models/userModel';
import { IResponse } from '../types';

export class QuerySearch {

    public text?: string = undefined
    public page?: number = undefined
    public size?: number = undefined

    public validate(): Promise<any> {
        return (new Promise((resolve: (query: any) => void, reject: (err: IResponse) => void): void => {
            recipLookUp(this.validator(), this).then((): void => {
                const query: any = {
                    mongo: {},
                    sort: {},
                    page: this.page || 0,
                    size: this.size || 100
                };
                if (this.text) {
                    query.mongo.$text = { $search: this.text.toLowerCase() };
                    query.sort = { score: { $meta: "textScore" } };
                }
                return (resolve(query));
            }).catch((err: IResponse): void => {
                return (reject(err));
            });
        }));
    }

    private validator(): any {
        return ({
            text: (text: string) => text !== '' ? true : false,
            page: (page: number) => page > -1 ? true : false,
            size: (size: number) => size > -1 ? true : false
        });
    }
};

export class QueryAuth {

    public user: string = ''

    public validate(): Promise<any> {
        return (new Promise((resolve: (query: any) => void, reject: (err: IResponse) => void): void => {
            recipLookUp(this.validator(), this).then((): void => {
                return (resolve({
                    email: this.user.split(':')[0],
                    passwd: this.user.split(':')[1]
                }));
            }).catch((err: IResponse): void => {
                return (reject(err));
            });
        }));
    }

    private validator(): any {
        return ({
            user: (user: string) => user !== '' ? true : false
        });
    }
};

export class QueryRegister {

    public yugiohid: string = ''
    public firstname: string = ''
    public lastname: string = ''
    public email: string = ''
    public phone?: string = undefined
    public passwd: string = ''
    public root?: boolean = undefined

    public validate(): Promise<any> {
        return (new Promise((resolve: (query: any) => void, reject: (err: IResponse) => void): void => {
            recipLookUp(this.validator(), this).then((): void => {
                const query: any = {
                    yugiohid: this.yugiohid,
                    firstname: this.firstname,
                    lastname: this.lastname,
                    email: this.email,
                    hash: this.passwd,
                };
                if (this.root !== undefined) query.root = this.root;
                if (this.phone) query.phone = this.phone;
                return (resolve(query));
            }).catch((err: IResponse): void => {
                return (reject(err));
            });
        }));
    }

    private validator(): any {
        return ({
            yugiohid: (yugiohid: string) => yugiohid !== '' ? true : false,
            firstname: (firstname: string) => firstname !== '' ? true : false,
            lastname: (lastname: string) => lastname !== '' ? true : false,
            email: (email: string) => email !== '' ? true : false,
            phone: (phone: string) => phone !== '' ? true : false,
            passwd: (passwd: string) => passwd !== '' ? true : false
        });
    }
};

export class QueryEdit {

    public id: string = ''
    public firstname?: string = undefined
    public lastname?: string = undefined
    public email?: string = undefined
    public phone?: string = undefined
    public passwd?: string = undefined
    public root?: boolean = undefined
    public active?: boolean = undefined

    public validate(): Promise<any> {
        return (new Promise((resolve: (query: any) => void, reject: (err: IResponse) => void): void => {
            recipLookUp(this.validator(), this).then((): void => {
                const query: any = {
                    id: this.id,
                    mongo: {}
                };
                if (this.firstname) query.mongo.firstname = this.firstname;
                if (this.lastname) query.mongo.lastname = this.lastname;
                if (this.phone) query.mongo.phone = this.phone;
                if (this.email) query.mongo.email = this.email;
                if (this.passwd) query.mongo.hash = this.passwd;
                if (this.root !== undefined) query.mongo.root = this.root;
                if (this.active) query.mongo.active = this.active;
                return (resolve(query));
            }).catch((err: IResponse): void => {
                return (reject(err));
            })
        }));
    }

    private validator(): any {
        return ({
            id: (id: string) => id !== '' ? true : false,
            firstname: (firstname: string) => firstname !== '' ? true : false,
            lastname: (lastname: string) => lastname !== '' ? true : false,
            phone: (phone: string) => phone !== '' ? true :false,
            email: (email: string) => email !== '' ? true : false,
            passwd: (passwd: string) => passwd !== '' ? true : false,
            perms: (perms: string) => perms !== '' ? true : false,
        });
    }
};

export class QueryId {
    public id: string = ''

    public validate(): Promise<any> {
        return (new Promise((resolve: (query: any) => void, reject: (err: IResponse) => void): void => {
            recipLookUp(this.validator(), this).then((): void => {
                return (resolve(this.id));
            }).catch((err: IResponse): void => {
                return (reject(err));
            });
        }))
    }

    private validator(): any {
        return ({
            id: (id: string) => id !== '' ? true : false
        });
    }
};

export class UserController {

    public searchHandler(req: Request, res: Response, next: NextFunction) {
        handShake([req.query], new QuerySearch()).then((recip: any): void => {
            User.search(recip).then((data: any): void => {
                res.status(200).json(data)
            }).catch((err: IResponse): void => {
                next(err);
            });
        }).catch((err: IResponse): void => {
            next(err);
        });
    }

    public detailsHandler(req: Request, res: Response, next: NextFunction) {
        handShake([req.params], new QueryId()).then((recip: any): void => {
            User.details(recip).then((data: any): void => {
                res.status(200).json(data);
            }).catch((err: IResponse): void => {
                next(err);
            });
        }).catch((err: IResponse): void => {
            next(err);
        });
    }

    public registerHandler(req: Request, res: Response, next: NextFunction) {
        handShake([req.body], new QueryRegister()).then((recip: any): void => {
            User.register(recip).then((data: any): void => {
                res.status(200).json(data)
            }).catch((err: IResponse): void => {
                next(err);
            });
        }).catch((err: IResponse): void => {
            next(err);
        });
    }

    public editHandler(req: Request, res: Response, next: NextFunction) {
        handShake([req.params, req.body], new QueryEdit()).then((recip: any): void => {
            User.edit(recip).then((data: any): void => {
                res.sendStatus(data);
            }).catch((err: IResponse): void => {
                next(err);
            });
        }).catch((err: IResponse): void => {
            next(err);
        });
    }

    public destroyHandler(req: Request, res: Response, next: NextFunction) {
        handShake([req.params], new QueryId()).then((recip: any): void => {
            User.destroy(recip).then((data: any): void => {
                res.sendStatus(data);
            }).catch((err: IResponse): void => {
                next(err);
            });
        }).catch((err: IResponse): void => {
            next(err);
        });
    }

    public authHandler(req: Request, res: Response, next: NextFunction): void {
        handShake([req.body], new QueryAuth()).then((recip: any): void => {
            User.auth(recip).then((data: any): void => {
                res.status(200).json(data);
            }).catch((err: IResponse): void => {
                next(err);
            });
        }).catch((err: IResponse): void => {
            next(err);
        });
    }
};