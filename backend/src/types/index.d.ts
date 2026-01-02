import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserPayload {
      _id: string;
      username?: string;
      email?: string;
      profileImage?: string | null;
    }

    interface Request {
      id?: JwtPayload;
      user?: UserPayload;
    }
  }
}

export {};