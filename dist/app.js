"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const user_route_1 = require("./app/modules/User/user.route");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const car_route_1 = require("./app/modules/Car/car.route");
const conversation_route_1 = require("./app/modules/Conversation/conversation.route");
const app = (0, express_1.default)();
//parser
app.set('trust proxy', 1);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// root api
app.get('/', (req, res) => {
    res.send('Hello from Car Shop!!!!!');
});
app.use('/api/auth', user_route_1.userRoutes);
app.use('/api/cars', car_route_1.carRoutes);
app.use('/api/conversations', conversation_route_1.conversationRoutes);
app.use(globalErrorHandler_1.default);
// app.use(notFound);
exports.default = app;
