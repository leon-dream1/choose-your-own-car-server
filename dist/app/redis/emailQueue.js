"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const queue_config_1 = require("../config/queue.config");
exports.emailQueue = new bullmq_1.Queue('email-queue', {
    connection: queue_config_1.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});
console.log('✓ Email queue initialized');
