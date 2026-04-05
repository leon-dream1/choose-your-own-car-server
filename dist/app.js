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
const compression_1 = __importDefault(require("compression"));
const order_route_1 = require("./app/modules/Order/order.route");
const helmet_1 = __importDefault(require("helmet"));
const config_1 = __importDefault(require("./app/config"));
const app = (0, express_1.default)();
//parser
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.default.client_url,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)());
// root api
app.get('/', (req, res) => {
    res.send('Car Shop Server is running..............!');
});
app.use('/api/auth', user_route_1.userRoutes);
app.use('/api/cars', car_route_1.carRoutes);
app.use('/api/conversations', conversation_route_1.conversationRoutes);
app.use('/api/orders', order_route_1.orderRoutes);
app.use(globalErrorHandler_1.default);
// app.use(notFound);
exports.default = app;
