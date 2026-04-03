import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { userRoutes } from './app/modules/User/user.route';
import cookieParser from 'cookie-parser';
import { carRoutes } from './app/modules/Car/car.route';
import { conversationRoutes } from './app/modules/Conversation/conversation.route';
import compression from 'compression';

const app: Application = express();

//parser
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// root api
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Car Shop!!!!!');
});

app.use('/api/auth', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/conversations', conversationRoutes);

app.use(globalErrorHandler);
// app.use(notFound);

export default app;
