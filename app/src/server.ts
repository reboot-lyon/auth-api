import { Server as HttpServer } from 'http';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import Routes from './routes';
import { MONGODB_URI, PORT, HOST } from './config';

export default class Server {

    public app: express.Application = express()
    public httpServer: HttpServer = new HttpServer(this.app)
    private routes: Routes = new Routes()

    constructor() {
        this.config();
        this.router();
        this.mongo();
    }

    public router(): void {
        this.app.use(this.routes.router);
        this.app.use(this.routes.errorController.hanlder);
    }

    public config(): void {
        this.app.use(
            helmet(),
            cors(),
            express.json(),
            express.urlencoded({ extended: true }),
            compression(),
        );
    }

    private mongo(): void {
        const connection = mongoose.connection;
        connection.on('connected', () => {
            console.log(`Connected to ${MONGODB_URI}`);
        });
        connection.on('disconnected', () => {
            console.log(`Disconnected from ${MONGODB_URI}\nTrying to reconnect to ${MONGODB_URI}`);
        });
        (async (): Promise<void> => {
            await mongoose.connect(MONGODB_URI, {
                    keepAlive: true,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                    socketTimeoutMS: 4000
                }, (err) => {
                if (err) { console.error(err); }
            });
        })();
    }

    public start(): void {
        this.httpServer.listen(PORT, HOST, () => {
            console.log(`Listening on ${HOST}:${PORT}`);
        });
    }
}