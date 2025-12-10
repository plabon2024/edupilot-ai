import jwt from "jsonwebtoken";
import User from "../models/User.js"; // be consistent: .js if compiled to JS
import { NextFunction, Request, Response } from "express";
import config from "../config/env.js";

const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
      statusCode: 401,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
      statusCode: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
        statusCode: 401,
      });
    }

    req.user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    };

     next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token has expired",
        statusCode: 401,
      });
    }

    return res.status(401).json({
      success: false,
      error: "Not authorized, token failed",
      statusCode: 401,
    });
  }

 
};

export default protect;
