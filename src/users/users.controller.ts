import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { sign } from 'jsonwebtoken';
import 'reflect-metadata';

import { BaseController } from '../common/base.controller';
import { AuthGuard } from '../common/guard.middleware';
import { ValidateMiddleware } from '../common/validate.middleware';
import { IConfigService } from '../config/config.service.interface';
import { HTTPError } from '../errors/http-error.class';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { IUserController } from './users.controller.interface';
import { IUserService } from './users.service.interface';


@injectable()
export class UserController extends BaseController implements IUserController {

    constructor(@inject(TYPES.ILogger) private loggerService: ILogger,
                @inject(TYPES.UserService) private userService: IUserService,
                @inject(TYPES.ConfigService) private configService: IConfigService) {
        super(loggerService);
        this.bindRoutes([
            {
                path: '/register',
                method: 'post',
                function: this.register,
                middlewares: [new ValidateMiddleware(UserRegisterDto)]
            },
            {
                path: '/login',
                method: 'post',
                function: this.login,
                middlewares: [new ValidateMiddleware(UserLoginDto)]
            },
            {
                path: '/info',
                method: 'get',
                function: this.info,
                middlewares: [new AuthGuard]
            },
        ]);
    }

    async login(req: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<void> {
        const result = await this.userService.validateUser(req.body);
        if (!result) {
            return next(new HTTPError(401, 'auth error', 'www'));
        }
        const jwt = await this.signJWT(req.body.email, this.configService.get('SECRET'));
        this.ok(res, { jwt });
    }

    async register(
        { body }: Request<{}, {}, UserRegisterDto>,
        res: Response,
        next: NextFunction): Promise<void> {
        const result = await this.userService.createUser(body);
        if (!result) {
            return next(new HTTPError(422, '?????????? ???????????????????????? ?????? ????????????????????'));
        }
        this.ok(res, { email: result.email, id: result.id });
    }

    async info({ user }: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void> {
        const userInfo = await this.userService.getUserInfo(user);
        this.ok(res, { email: userInfo?.email, id: userInfo?.id });
    }

    private signJWT(email: string, secret: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            sign({
                email,
                iat: Math.floor(Date.now() / 1000)
            }, secret, {
                algorithm: 'HS256'
            }, (err, token) => {
                if (err) {
                    reject(err);
                }
                resolve(token as string);
            });
        });
    }
}
