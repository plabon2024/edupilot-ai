import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      id: JwtPayload;
    }
    interface UserPayload {
      _id: string;
      username?: string;
      email?: string;
      profileImage?: string | null;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
