import { Router } from 'express';
import { UserController } from '../../../controllers/userController';
import { NoneController } from '../../../controllers/multerController';
import { AuthController } from '../../../controllers/authController';

export default class AuthRoutes {

    public router: Router
    private userController: UserController = new UserController()
    private authController: AuthController = new AuthController()

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes(): void {
        this.router.get('/', this.userController.searchHandler);
        this.router.get('/:id', this.userController.detailsHandler);
        this.router.post('/', NoneController, this.userController.registerHandler);
        this.router.post('/auth', this.authController.authHandler, this.userController.authHandler);
        this.router.put('/:id', NoneController, this.userController.editHandler);
        this.router.delete('/revoke', this.userController.revokeHandler);
        this.router.delete('/:id', this.userController.destroyHandler);
    }
}