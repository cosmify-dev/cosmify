import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";

export const authorize = () => {
  return async function (req: Request, res: Response, next: NextFunction) {
    const authHeaders = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    const user = (res.locals.user = authHeaders.user);
    const organizationId = authHeaders.session?.activeOrganizationId;
    if (!user || !organizationId || organizationId.length <= 0) return res.status(401).end();
    res.locals.organizationId = organizationId;
    next();
  };
};
