import fetch from 'node-fetch';
import { IResponse, QueryValueError, QueryFieldError } from '../types';

export function recipLookUp(buffer: any, recip: any): Promise<any> {
    return (new Promise((resolve: () => void, reject: (err: IResponse) => void): void => {
        for (const key in recip) {
            if (recip[key] !== undefined && buffer[key] && !buffer[key](recip[key]))
                return (reject(QueryValueError(key)));
        }
        return (resolve());
    }));
};

export function handShake(buffer: any[], recip: any): Promise<any> {
    return (new Promise((resolve: (recip: any) => void, reject: (response: IResponse) => void): void => {
        const marker: any = Object.assign({}, recip);
        for (const key in recip) {
            recip[key] = undefined;
            buffer.forEach((elem) => {
                if (recip[key] === undefined && elem[key] !== undefined)
                    recip[key] = elem[key];
            });
            if (marker[key] !== undefined && recip[key] === undefined)
                return (reject(QueryFieldError(key)));
        }
        console.log(recip);
        recip.validate().then((mongoQuery: any): void => {
            return (resolve(mongoQuery));
        }).catch((err: any): void => {
            return (reject(err));
        });
    }));
};

function fetchApi({ api, method, path, data, token }: { api: string, method: string, path: string, data?: any, token?: string }): Promise<any> {
    return (new Promise((resolve: (res: any) => void, reject: (err: any) => void): void => {
        const opts: { method: string, headers: any, body?: any } = { method, headers: {} };
        if (data) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(data);
        } if (token) {
            opts.headers['Authorization'] = `Bearer ${token}`;
        }
        fetch(`${api}${path}`, opts)
            .then(res => res.text())
            .then(json => {
                const data = JSON.parse(json);
                if (data.error !== undefined) return (reject(data.error));
                else return (resolve(data));
        });
    }));
};

export function getApi(api: string, path: string, token?: string): Promise<any> {
    return (fetchApi({ api, method: 'GET', path, token }));
};

export function postApi(api: string, path: string, data: any, token?: string): Promise<any> {
    return (fetchApi({ api, method: 'POST', path, data, token }));
};

export function putApi(api: string, path: string, data: any, token?: string): Promise<any> {
    return (fetchApi({ api, method: 'PUT', path, data, token }));
};

export function delApi(api: string, path: string, token?: string): Promise<any> {
    return (fetchApi({ api, method: 'DELETE', path, token }));
};