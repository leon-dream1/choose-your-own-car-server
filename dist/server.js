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
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./app/config"));
const redis_config_1 = __importDefault(require("./app/config/redis.config"));
require("./app/redis/emailWorker");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./app/socket/socket");
function server() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Redis test
            yield redis_config_1.default.set('test', 'Redis is working!');
            const value = yield redis_config_1.default.get('test');
            console.log('✓ Redis test:', value);
            yield mongoose_1.default.connect(config_1.default.database_url);
            const httpServer = http_1.default.createServer(app_1.default);
            (0, socket_1.initSocket)(httpServer);
            httpServer.listen(config_1.default.port, () => {
                console.log(`Example app listening on port ${config_1.default.port}`);
            });
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
    });
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
