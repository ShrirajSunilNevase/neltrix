import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(err.status ?? 500).json({
    error: "Request failed",
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
  });
}
