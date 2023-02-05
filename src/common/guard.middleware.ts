import { NextFunction, Request, Response } from 'express';
import { IMiddleWare } from './middleware.interface';

export class AuthGuard implements IMiddleWare {
    
    execute({ user }: Request, res: Response, next: NextFunction) {
        if (user) {
            return next();
        }
        res.status(401).send({ error: 'Вы не авторизованы' });
    }
}
