import bcrypt from 'bcrypt';
import { model, Model, Schema, Document } from 'mongoose';
import { InternalError, IResponse, QueryIdError, AuthPasswdError, AuthEmailError, InternalApiError } from '../types';
import { TOKEN_EXP, YUGIOH_URL } from '../config';
import { Token, IToken } from './tokenModel';

export interface IUserSchema extends Document {
    yugiohid: string,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    hash: string,
    root: boolean,
    active: boolean
};

export interface IUser extends IUserSchema {
    comparePasswd: (passwd: string) => Promise<any>,
    setPasswd: (passwd: string) => Promise<any>,
    getPerms: () => string
};

interface IUserModel extends Model<IUser> {
    search: (query: any) => Promise<any>,
    details: (query: any) => Promise<any>,
    edit: (query: any) => Promise<any>,
    auth: (query: any) => Promise<any>,
    register: (query: any) => Promise<any>,
    destroy: (query: any) => Promise<any>
};

export const UserSchema: Schema<IUser> = new Schema<IUser>({
    yugiohid: { type: String, required: true },
    firstname: { type: String, required: true, lowercase: true },
    lastname: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    hash: { type: String, required: true },
    root: { type: Boolean, default: false },
    active: { type: Boolean, required: true, default: false }
}, { timestamps: true }).index({ firstname: 'text', lastname: 'text', email: 'text', yugiohid: 'text' });

UserSchema.methods.comparePasswd = function (passwd: string): Promise<any> {
    return (new Promise((resolve: (match: boolean) => void, reject: (err: any) => void): void => {
        bcrypt.compare(passwd, this.hash).then((match: boolean): void => {
            return (match ? resolve(match) : reject(null));
        }).catch((err: any): void => {
            return (reject(err));
        })
    }));
};

UserSchema.methods.setPasswd = function (passwd: string): Promise<any> {
    return (new Promise((resolve: (hash: string) => void, reject: (err: any) => void): void => {
        bcrypt.hash(passwd, 10).then((newHash: string): void => {
            return (resolve(newHash));
        }).catch((err: any): void => {
            return (reject(err));
        });
    }));
};

UserSchema.methods.getPerms = function (): string {
    return (this.root ? 'root' : '');
}

UserSchema.statics.search = function (query: any): Promise<any> {
    return (new Promise((resolve: (users: IUser[]) => void, reject: (err: IResponse) => void): void => {
        User.find(query.mongo, query.sort)
        .sort(query.sort)
        .select('-hash -createdAt -updatedAt -__v')
        .then((users: IUser[]): void => {
            return (resolve(users.slice(query.page*query.size, query.page*query.size + query.size)));
        }).catch((err: any): void => {
            return (reject(InternalError(err)));
        });
    }));
};

UserSchema.statics.details = function (query: any): Promise<any> {
    return (new Promise((resolve: (users: IUser) => void, reject: (err: IResponse) => void): void => {
        User.findById(query)
        .select('-_id -hash -createdAt -updatedAt -__v')
        .then((user: IUser | null): void => {
            if (!user) {
                return (reject(QueryIdError));
            } else {
                return (resolve(user));
            }
        }).catch((err: any): void => {
            return (reject(InternalError(err)));
        });
    }));
};

UserSchema.statics.register = function(query: any): Promise<any> {
    return (new Promise((resolve: (id: any) => void, reject: (err: IResponse) => void): void => {
        User.findOne({ yugiohid: query.yugiohid, email: query.email }).then((user: IUser | null): void => {
            if (!user) {
                new User(query).save().then((user: IUser): void => {
                    return (resolve({ id: user._id }));
                }).catch((err: any): void => {
                    return (reject(InternalError(err)));
                });
            } else {
                return (reject(QueryIdError));
            }
        }).catch((err: any): void => {
            return (reject((InternalError(err))));
        });
    }));
};

UserSchema.statics.edit = function(query: any): Promise<any> {
    return (new Promise((resolve: (status: number) => void, reject: (err: IResponse) => void): void => {
        User.findById(query.id).then((user: IUser | null): void => {
            if (!user) {
                return (reject(QueryIdError));
            } else {
                user.set(query.mongo).save().then((): void => {
                    return (resolve(200));
                }).catch((err: any): void => {
                    return (reject(InternalError(err)));
                });
            }
        }).catch((err: any): void => {
            return (reject(InternalError(err)));
        });
    }));
};

UserSchema.statics.destroy = function (query: any): Promise<any> {
    return (new Promise((resolve: (status: number) => void, reject: (err: IResponse) => void): void => {
        User.findById(query).then((user: IUser | null): void => {
            if (!user) {
                return (reject(QueryIdError));
            } else {
                user.remove().then((): void => {
                    return (resolve(200));
                }).catch((err: any): void => {
                    return (reject(InternalError(err)));
                })
            }
        }).catch((err: any): void => {
            return (reject(InternalError(err)));
        });
    }));
};

UserSchema.statics.auth = function(query: any): Promise<any> {
    return (new Promise((resolve: (token: any) => void, reject: (err: IResponse) => void): void => {
        User.findOne({ email: query.email, active: true })
        .then((user: IUser | null): void => {
            if (!user) {
                return (reject(AuthEmailError));
            } else {
                user.comparePasswd(query.passwd).then((match: boolean): void => {
                    Token.findOne({ user: user._id }).then((token: IToken | null): void => {
                        if (!token) {
                            new Token({ user: user._id, exp: Date.now() + TOKEN_EXP * 1000, perms: user.getPerms() }).save().then((token: IToken): void => {
                                return (resolve({ token: token.token }));
                            }).catch((err: any): void => {
                                return (reject(InternalError(err)));
                            });
                        } else if (token.isExpired()) {
                                token.refresh(user.getPerms()).then((token: IToken): void => {
                                    return (resolve({ token: token.token }));
                            }).catch((err: any): void => {
                                return (reject(InternalError(err)));
                            })
                        } else {
                            return (resolve({ token: token.token }));
                        }
                    })
                }).catch((err: any): void => {
                    return (reject(AuthPasswdError));
                });
            }
        }).catch((err: any): void => {
            return (reject(InternalError(err)));
        });
    }))
};

UserSchema.pre<IUser>('save', function (next: Function) {
    const tasks: Promise<any>[] = [];
    if (this.isNew || this.isModified('hash')) {
        tasks.push(this.setPasswd(this.hash).then((hash: string): void => {
            this.hash = hash;
        }));
    } if (this.isModified('perms')) {
        tasks.push(new Promise((resolve: () => void, reject: (err: any) => void): void => {
            Token.find({ user: this._id }).then((tokens: IToken[]): void => {
                const tokenTasks: Promise<any>[] = [];
                tokens.forEach((token) => tokenTasks.push(token.refresh(this.getPerms())));
                Promise.all(tokenTasks).then((): void => {
                    return (resolve());
                }).catch((err: any): void => {
                    return (reject(err));
                });
            }).catch((err: any): void => {
                return (reject(err));
            });
        }));
    }
    Promise.all(tasks).then((): void => {
        next();
    }).catch((err: any): void => {
        next(err);
    });
});

UserSchema.pre<IUser>('remove', function (next: Function) {
    Token.find({ user: this._id }).then((tokens: IToken[]): void => {
        const tasks: Promise<any>[] = [];
        tokens.forEach(token => tasks.push(token.remove()));
        Promise.all(tasks).then((): void => {
            next();
        }).catch((err: any): void => {
            next(err);
        });
    }).catch((err: any): void => {
        next(err);
    })
});

export const User: IUserModel =  model<IUser, IUserModel>('User', UserSchema);