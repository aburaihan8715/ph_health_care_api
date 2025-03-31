import express, {
  Application,
  NextFunction,
  Request,
  Response,
} from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

import notFoundRouteHandler from './app/middlewares/notFoundRouteHandler';

const app: Application = express();

// GLOBAL MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// TEST MIDDLEWARE
app.use(
  (
    req: Request & { requestTime?: string },
    res: Response,
    next: NextFunction,
  ) => {
    req.requestTime = new Date().toISOString();
    next();
  },
);

// TEST ROUTE
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello from ph_healthcare server!',
  });
});

// ROUTES
app.use('/api/v1', router);

// NOT FOUND ROUTE HANDLER
app.use(notFoundRouteHandler);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;

// ==========end===========
