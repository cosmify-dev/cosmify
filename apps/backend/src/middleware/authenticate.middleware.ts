import { NextFunction, Request, Response } from "express";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  next();
}
