/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const generateToken = (
  payload: any,
  secret: Secret,
  expireTime: SignOptions['expiresIn'] = '1h',
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: expireTime,
  });

  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
