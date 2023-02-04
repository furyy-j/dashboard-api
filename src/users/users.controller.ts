import { inject, injectable } from 'inversify';
import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error.class';
import { ILogger } from '../logger/logger.interface';
import { NextFunction, Request, Response } from 'express';
import { TYPES } from '../types';
import 'reflect-metadata';
import { IUserController } from './users.controller.interface';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
		super(loggerService);
		this.bindRoutes([
			{ path: '/register', method: 'post', function: this.register },
			{ path: '/login', method: 'post', function: this.login },
		]);
	}

	login(req: Request, res: Response, next: NextFunction): void {
		next(new HTTPError(401, 'auth error', 'www'));
		// this.ok(res, 'login');
	}

	register(req: Request, res: Response, next?: NextFunction): void {
		this.ok(res, 'register');
	}
}
