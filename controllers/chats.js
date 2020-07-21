const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Room = require('../models/Chat/Room.js');
const Message = require('../models/Chat/Message.js');

// @desc      Initiate chat
// @route     POST /api/v1/chats/initiate
// @access    Private
exports.initiateChatRoom = asyncHandler(async (req, res) => {
   
      const { userIds } = req.body;
      const { userId: chatInitiator } = req.user.id;
      const allUserIds = [...userIds, chatInitiator];
      const chatRoom = await Room.initiateChat(allUserIds , chatInitiator);
      return res.status(200).json({ success: true, chatRoom });
    
});

// @desc      Post message
// @route     POST /api/v1/chats/:roomId/message
// @access    Private
exports.postMessage = asyncHandler(async (req, res) => {
    
      const { roomId } = req.params;

      const messagePayload = {
        message: req.body.message,
      };

      const currentLoggedUser = req.user.id;
      const post = await Message.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);
      global.io.sockets.in(roomId).emit('new message', { message: post });
      return res.status(200).json({ success: true, post });
  
});


// @desc      Get recent conversation
// @route     GET /api/v1/chats
// @access    Private
exports.getRecentConversation = asyncHandler(async (req, res) => {
    
      const currentLoggedUser = req.user.id;
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const rooms = await Room.getChatRoomsByUserId(currentLoggedUser);
      const roomIds = rooms.map(room => room._id);
      const recentConversation = await Message.getRecentConversation(
        roomIds, options, currentLoggedUser
      );
      return res.status(200).json({ success: true, conversation: recentConversation });
    
});

// @desc      Get conversation by room id
// @route     GET /api/v1/chats/:roomId
// @access    Private
exports.getConversationByRoomId = asyncHandler(async (req, res) => {
    
      const { roomId } = req.params;
      const room = await Room.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }

      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const conversation = await Message.getConversationByRoomId(roomId, options);
      return res.status(200).json({
        success: true,
        conversation,
      });
    
});

// @desc      Mark conversation as read
// @route     PUT /api/v1/chats/:roomId/mark-read
// @access    Private
exports.markConversationReadByRoomId = asyncHandler(async (req, res) => {
    
      const { roomId } = req.params;
      const room = await Room.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }

      const currentLoggedUser = req.user.id;
      const result = await Message.markMessageRead(roomId, currentLoggedUser);
      return res.status(200).json({ success: true, data: result });
    
  });
