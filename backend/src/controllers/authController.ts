import jwt from "jsonwebtoken";

import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const register=async(req,res,next)=>{
    try {
        
    } catch (error) {
        next(error)
    }
}

export const login=async(req,res,next)=>{
    try {
        
    } catch (error) {
        next(error)
    }
}


export const getProfile=async(req,res,next)=>{
    try {
        
    } catch (error) {
        next(error)
    }
}
export const updateProfile=async(req,res,next)=>{
    try {
        
    } catch (error) {
        next(error)
    }
}
export const changePassword=async(req,res,next)=>{
    try {
        
    } catch (error) {
        next(error)
    }
}




