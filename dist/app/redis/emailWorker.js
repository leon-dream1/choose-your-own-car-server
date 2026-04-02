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
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = void 0;
const bullmq_1 = require("bullmq");
const queue_config_1 = require("../config/queue.config");
const sendEmail_1 = require("../utils/sendEmail");
exports.emailWorker = new bullmq_1.Worker('email-queue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, html } = job.data;
    console.log(`📧 Sending email to ${to}... (attempt ${job.attemptsMade + 1})`);
    yield (0, sendEmail_1.sendEmail)(to, subject, html);
    console.log(`✓ Email sent to ${to}`);
}), {
    connection: queue_config_1.redisConnection,
    concurrency: 5,
});
exports.emailWorker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} completed — email sent to ${job.data.to}`);
});
exports.emailWorker.on('failed', (job, error) => {
    console.error(`✗ Job ${job === null || job === void 0 ? void 0 : job.id} failed:`, error.message);
});
exports.emailWorker.on('ready', () => {
    console.log('✓ Email worker ready');
});
