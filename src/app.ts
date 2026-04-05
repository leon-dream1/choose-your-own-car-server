import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { userRoutes } from './app/modules/User/user.route';
import cookieParser from 'cookie-parser';
import { carRoutes } from './app/modules/Car/car.route';
import { conversationRoutes } from './app/modules/Conversation/conversation.route';
import compression from 'compression';
import { orderRoutes } from './app/modules/Order/order.route';
import helmet from 'helmet';
import config from './app/config';

const app: Application = express();

//parser
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: config.client_url,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// root api
app.get('/', (req: Request, res: Response) => {
  res.send('Car Shop Server is running..............!');
});

app.use('/api/auth', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/orders', orderRoutes);

app.use(globalErrorHandler);
// app.use(notFound);

export default app;
