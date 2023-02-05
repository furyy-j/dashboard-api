import { inject, injectable } from 'inversify';
import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error.class';
import { ILogger } from '../logger/logger.interface';
import { NextFunction, Request, Response } from 'express';
import { TYPES } from '../types';
import 'reflect-metadata';
import { IUserController } from './users.controller.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

import { IUserService } from './users.service.interface';
import { ValidateMiddleware } from '../common/validate.middleware';


@injectable() 
export class UserController extends BaseController implements IUserController {

	constructor(@inject(TYPES.ILogger) private loggerService: ILogger,
				@inject(TYPES.UserService) private userService: IUserService) {
		super(loggerService);
		this.bindRoutes([
		{ 
			path: '/register', 
			method: 'post', 
			function: this.register, 
			middlewares: [new ValidateMiddleware(UserRegisterDto)] 
		},
		{ path: '/login', 
			method: 'post', 
			function: this.login 
		},
		]);
	}

	login(req: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): void {
		console.log(req.body)
		next(new HTTPError(401, 'auth error', 'www'));
		// this.ok(res, 'login');
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>, 
		res: Response, 
		next: NextFunction): Promise<void> {
			const result = await this.userService.createUser(body);
			if (!result) {
				return next(new HTTPError(422,'Такой пользователь уже существует'))
			}
			this.ok(res, { email: result.email });
	}
}
