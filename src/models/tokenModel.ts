import jwt from 'jsonwebtoken';
import { model, Model, Schema, Document } from 'mongoose';
import { InternalError, IResponse, QueryIdError } from '../types';
import { TOKEN_EXP, PRIV_KEY } from '../config';

export interface ITokenSchema extends Document {
    user: Schema.Types.ObjectId,
    exp: Date,
    token: string,
    perms: string
};

export interface IToken extends ITokenSchema {
    sign: () => Promise<IToken>,
    refresh: (perms: string) => Promise<IToken>,
    isExpired: () => boolean
};

interface ITokenModel extends Model<IToken> {
    destroy: (query: any) => Promise<any>
};

export const TokenSchema: Schema<IToken> = new Schema<IToken>({
    user: { type: Schema.Types.ObjectId, required: true },
    exp: { type: Date, default: Date.now, required: true },
    token: { type: String },
    perms: { type: String }
}, { timestamps: true }).index({ "exp": 1 }, { expireAfterSeconds: 0 });

TokenSchema.methods.refresh = function(perms: string): Promise<IToken> {
    return (new Promise((resolve: (token: IToken) => void, reject: (err: any) => void): void => {
        console.log(perms, this.perms);
        this.set({ exp: this.exp.setTime(this.exp.getTime() + TOKEN_EXP * 1000) , perms: perms }).save().then((token: IToken): void => {
            console.log(token.perms);
            return (resolve(token));
        }).catch((err: any): void => {
            return (reject(err));
        });
    }));
};

TokenSchema.methods.sign = function(): Promise<IToken> {
    return (new Promise((resolve: (token: IToken) => void, reject: (err: any) => void): void => {
        jwt.sign({ id: this._id, scope: this.perms }, PRIV_KEY, { algorithm: 'RS256', expiresIn: TOKEN_EXP }, (err: Error | null, token: string | undefined) => {
            if (err || !token) {
                return (reject(err));
            } else {
                return (resolve(this.set({ token: token })));
            }
        });
    }));
};

TokenSchema.methods.isExpired = function(): boolean {
    return (Date.now() > this.exp.getTime());
};

TokenSchema.statics.destroy = function (query: any): Promise<any> {
    return (new Promise((resolve: (status: number) => void, reject: (err: IResponse) => void): void => {
        Token.findById(query).then((token: IToken | null): void => {
            if (!token) {
                return (reject(QueryIdError));
            } else {
                token.remove().then((): void => {
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

TokenSchema.pre<IToken>('save', function (next: Function) {
    this.sign().then((token: IToken): void => {
        next();
    }).catch((err: any): void => {
        next(err);
    });
});

export const Token: ITokenModel = model<IToken, ITokenModel>('Token', TokenSchema);