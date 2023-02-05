import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ValidateMiddleware } from '../common/validate.middleware';
import { UserRegisterDto } from './dto/user-register.dto';
import { IUserController } from './users.controller.interface';
import { BaseController } from '../common/base.controller';
import { IConfigService } from '../config/config.service.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { IUserService } from './users.service.interface';
import { HTTPError } from '../errors/http-error.class';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import { sign } from 'jsonwebtoken';
import 'reflect-metadata';


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
            return next(new HTTPError(422, 'Такой пользователь уже существует'));
        }
        this.ok(res, { email: result.email, id: result.id });
    }
    
    async info({ user }: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void>  {
        this.ok(res, { email: user });
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
