import { Router } from 'express';
import UserRoutes from './users';

export default class ApiRoutes {

    public router: Router
    private userRoutes: UserRoutes = new UserRoutes()

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes(): void {
        this.router.use('/users', this.userRoutes.router);
    }
};