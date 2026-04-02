"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const globalErrorHandler = (err, req, res, next) => {
    // default response
    let statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong!';
    let errorSources = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];
    if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = 'Duplicate field value';
        const field = Object.keys(err.keyValue)[0];
        errorSources = [
            {
                path: field,
                message: `${field} already exists`,
            },
        ];
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'ZodError') {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = 'Validation Error';
        errorSources = err.issues.map((issue) => ({
            path: issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1],
            message: issue === null || issue === void 0 ? void 0 : issue.message,
        }));
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'ValidationError') {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = 'Validation Error';
        errorSources = Object.values(err.errors).map((val) => {
            return {
                path: val === null || val === void 0 ? void 0 : val.path,
                message: val === null || val === void 0 ? void 0 : val.message,
            };
        });
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err === null || err === void 0 ? void 0 : err.statusCode;
        message = err === null || err === void 0 ? void 0 : err.message;
        errorSources = [
            {
                path: '',
                message: err === null || err === void 0 ? void 0 : err.message,
            },
        ];
    }
    else if (err instanceof Error) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = err.message;
        errorSources = [
            {
                path: '',
                message: err === null || err === void 0 ? void 0 : err.message,
            },
        ];
    }
    res.status(statusCode).json({
        success: false,
        message,
        // err,
        errorSources,
        stack: config_1.default.NODE_ENV === 'development' ? err === null || err === void 0 ? void 0 : err.stack : null,
    });
};
exports.default = globalErrorHandler;
