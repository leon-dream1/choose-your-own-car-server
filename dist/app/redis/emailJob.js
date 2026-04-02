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
exports.addResetPasswordJob = exports.addVerifyEmailJob = void 0;
const emailTemplate_1 = require("../utils/emailTemplate");
const emailQueue_1 = require("./emailQueue");
const addVerifyEmailJob = (email, verifyLink) => __awaiter(void 0, void 0, void 0, function* () {
    yield emailQueue_1.emailQueue.add('verify-email', {
        to: email,
        subject: 'Choose Your Own Car — Verify your Email',
        html: (0, emailTemplate_1.verifyEmailTemplate)(verifyLink),
    }, {
        jobId: `verify-${email}`,
    });
    console.log(`✓ Verify email job added for ${email}`);
});
exports.addVerifyEmailJob = addVerifyEmailJob;
const addResetPasswordJob = (email, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    yield emailQueue_1.emailQueue.add('reset-password', {
        to: email,
        subject: 'Choose Your Own Car — Password Reset',
        html: (0, emailTemplate_1.resetPasswordTemplate)(resetLink),
    }, {
        jobId: `reset-${email}-${Date.now()}`,
    });
    console.log(`✓ Reset password job added for ${email}`);
});
exports.addResetPasswordJob = addResetPasswordJob;
