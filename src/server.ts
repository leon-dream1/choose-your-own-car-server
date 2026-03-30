import app from './app';
import mongoose from 'mongoose';
import config from './app/config';
import redisClient from './app/config/redis.config';
import './app/redis/emailWorker';

async function server() {
  try {
    // Redis test
    await redisClient.set('test', 'Redis is working!');
    const value = await redisClient.get('test');
    console.log('✓ Redis test:', value);

    await mongoose.connect(config.database_url as string);

    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

server();

// process.on('uncaughtException', () => {
//   console.log(`uncaughtException is detected , shut done server`);
//   process.exit(1);
// });

// process.on('unhandledRejection', () => {
//   if (server) {
//     server.close(() => {
//       console.log(`unhandledRejection is detected , shut done server`);
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });
