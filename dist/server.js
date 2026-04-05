"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./app/config"));
const redis_config_1 = __importDefault(require("./app/config/redis.config"));
require("./app/redis/emailWorker");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./app/socket/socket");
let server;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Redis test
            yield redis_config_1.default.set('test', 'Redis is working!');
            const value = yield redis_config_1.default.get('test');
            console.log('✓ Redis test:', value);
            yield mongoose_1.default.connect(config_1.default.database_url, {
                maxPoolSize: 50,
                minPoolSize: 5,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                maxIdleTimeMS: 30000,
            });
            const httpServer = http_1.default.createServer(app_1.default);
            (0, socket_1.initSocket)(httpServer);
            server = httpServer.listen(config_1.default.port, () => {
                console.log(`Example app listening on port ${config_1.default.port}`);
            });
            const shutdown = (signal) => __awaiter(this, void 0, void 0, function* () {
                console.log(`\n${signal} received. Shutting down gracefully...`);
                httpServer.close(() => __awaiter(this, void 0, void 0, function* () {
                    console.log('✓ HTTP server closed');
                    yield mongoose_1.default.connection.close();
                    console.log('✓ MongoDB disconnected');
                    console.log('✓ Graceful shutdown complete');
                    process.exit(0);
                }));
                setTimeout(() => {
                    console.error('✗ Forced shutdown');
                    process.exit(1);
                }, 10000);
            });
            process.on('SIGTERM', () => shutdown('SIGTERM'));
            process.on('SIGINT', () => shutdown('SIGINT')); // CTRL+C
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
    });
}
startServer();
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    console.error(' Stack:', error.stack);
    process.exit(1);
});
// process.on('uncaughtException', () => {
//   console.log(`uncaughtException is detected , shut done server`);
//   process.exit(1);
// });
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    if (server) {
        server.close(() => {
            console.log('Server closed after unhandledRejection');
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
// process.on('unhandledRejection', (): Promise<unknown => {
//   if (server) {
//     server.close(() => {
//       console.log(`unhandledRejection is detected , shut done server`);
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });
