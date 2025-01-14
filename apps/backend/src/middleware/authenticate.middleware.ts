import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const session2 = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });
  next();
}
