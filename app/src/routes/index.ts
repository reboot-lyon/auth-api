import { Router } from 'express';
import ErrorController from '../controllers/errorController';
import ApiRoutes from './api';

export default class Routes {

    public router: Router
    public errorController: ErrorController = new ErrorController()
    private apiRoutes: ApiRoutes = new ApiRoutes()

    constructor() {
        this.router = Router();
        this.routes();
    }

    public routes(): void {
        this.router.use('/api', this.apiRoutes.router);
        this.router.use(this.errorController.trigger);
    }
}