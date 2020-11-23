import { Router } from 'express';
import { TokenController } from '../../../controllers/tokenController';
import { AuthController } from '../../../controllers/authController';

export default class TokenRoutes {

    public router: Router
    private tokenController: TokenController = new TokenController()
    private authController: AuthController = new AuthController()

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes(): void {
        this.router.delete('/revoke', this.authController.tokenHandler, this.tokenController.revokeHandler);
    }
}