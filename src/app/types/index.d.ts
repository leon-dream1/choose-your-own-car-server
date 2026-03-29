declare namespace Express {
  interface Request {
    user?: TJwtPayload;
  }
}
