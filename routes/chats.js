import express from 'express';
import chats from '../controllers/chats.js';

const router = express.Router();
import { protect } from '../middleware/auth.js';
router
  .get('/', protect , chats.getRecentConversation)
  .get('/:roomId', protect, chats.getConversationByRoomId)
  .post('/initiate', protect , chats.initiateChatRoom)
  .post('/:roomId/message', protect , chats.postMessage)
  .put('/:roomId/mark-read', protect , chats.markConversationReadByRoomId)

  export default router ;