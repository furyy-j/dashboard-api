import { NextFunction, Request, Response, Router } from 'express';

export interface IControllerRoute {
	path: string;
	function: (req: Request, res: Response, next: NextFunction) => void;
	method: keyof Pick<Router, 'get' | 'delete' | 'post' | 'patch' | 'put'>;
}

export type ExpressReturnType = Response<any, Record<string, any>>;
