import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { conversationValidation } from './conversation.validation';
import { conversationControllers } from './conversation.controller';

const router = Router();

router.post(
  '/start',
  auth('user', 'seller'),
  validateRequest(conversationValidation.startConversationSchema),
  conversationControllers.startConversation
);

router.get(
  '/:id/messages',
  auth('user', 'seller'),
  conversationControllers.getMessages
);

router.get(
  '/',
  auth('user', 'seller'),
  conversationControllers.getMyConversations
);

router.get(
  '/unread-count',
  auth('user', 'seller'),
  conversationControllers.getUnreadCount
);

export const conversationRoutes = router;
