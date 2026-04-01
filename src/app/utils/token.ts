import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export type TJwtPayload = JwtPayload & {
  _id: string;
  email: string;
  name: string;
  role: string;
};

export const createToken = (
  payload: object,
  secret: string,
  expiresIn: SignOptions['expiresIn']
) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string, secret: string): TJwtPayload => {
  return jwt.verify(token, secret) as TJwtPayload;
};
