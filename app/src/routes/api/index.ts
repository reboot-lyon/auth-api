import { Router } from 'express';
import UserRoutes from './users';
import TokenRoutes from './tokens';

export default class ApiRoutes {

    public router: Router
    private userRoutes: UserRoutes = new UserRoutes()
    private tokenRoutes: TokenRoutes = new TokenRoutes()

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes(): void {
        this.router.use('/users', this.userRoutes.router);
        this.router.use('/tokens', this.tokenRoutes.router);
    }
};