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
  '/unread-count',
  auth('user', 'seller'),
  conversationControllers.getUnreadCount
);

router.get(
  '/',
  auth('user', 'seller'),
  conversationControllers.getMyConversations
);

router.get(
  '/:id/messages',
  auth('user', 'seller'),
  conversationControllers.getMessages
);

router.delete(
  '/:id',
  auth('user', 'seller'),
  conversationControllers.deleteConversation
);

// router.patch(
//   '/:id/messages/read',
//   auth('user', 'seller'),
//   conversationControllers.markAllAsRead
// );

export const conversationRoutes = router;
