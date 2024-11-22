import { Request, Response, NextFunction } from 'express';

const parseBodyString = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        req.body = await JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default parseBodyString;
