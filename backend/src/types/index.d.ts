
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserPayload {
      _id: string;
      username?: string;
      email?: string;
      profileImage?: string | null;
    }

    // ✅ Only one Request interface
    interface Request {
      id?: JwtPayload; // Make optional
      user?: UserPayload;
    }
  }
}