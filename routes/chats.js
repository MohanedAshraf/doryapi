const express = require('express');
const {
  initiateChatRoom,
  postMessage ,
  getConversationByRoomId,
  getRecentConversation,
  markConversationReadByRoomId
} = require('../controllers/chats');

const router = express.Router();
const { protect } = require('../middleware/auth');
router
  .get('/', protect , getRecentConversation)
  .get('/:roomId', protect, getConversationByRoomId)
  .post('/initiate', protect ,initiateChatRoom)
  .post('/:roomId/message', protect , postMessage)
  .put('/:roomId/mark-read', protect , markConversationReadByRoomId)

  module.exports = router;