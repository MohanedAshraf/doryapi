import ErrorResponse from '../utils/errorResponse.js';
import mongoose from "mongoose";
import asyncHandler from '../middleware/async.js';
import Room from '../models/Chat/Room.js';
import Message from '../models/Chat/Message.js';

export default {


// @desc      Initiate chat
// @route     POST /api/v1/chats/initiate
// @access    Private
initiateChatRoom : asyncHandler(async (req, res) => {
   
      const { userIds } = req.body;
      const { userId: chatInitiator } = req.user.id;
      const allUserIds = [...userIds, chatInitiator];
      const chatRoom = await Room.initiateChat(allUserIds , chatInitiator);
      return res.status(200).json({ success: true, chatRoom });
    
}),

// @desc      Post message
// @route     POST /api/v1/chats/:roomId/message
// @access    Private
postMessage : asyncHandler(async (req, res) => {
    
      const { roomId } = req.params;

    
      const currentLoggedUser = req.user.id;
      const post = await Message.createPostInChatRoom(roomId, req.body.message, currentLoggedUser , req.user.role);
      global.io.sockets.in(roomId).emit('new message', { message: post[0] });
      return res.status(200).json({ success: true, post:post[0] });
  
}),
 

// @desc      Get recent conversation
// @route     GET /api/v1/chats
// @access    Private
getRecentConversation : asyncHandler(async (req, res) => {
    
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
      return res.status(200).json({ success: true, count : recentConversation.length, conversation: recentConversation });
    
}),

// @desc      Get conversation by room id
// @route     GET /api/v1/chats/:roomId
// @access    Private
getConversationByRoomId : asyncHandler(async (req, res) => {
    
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
        limit: parseInt(req.query.limit) || 10000,
      };
      

      const conversation = await Message.getConversationByRoomId(mongoose.Types.ObjectId(roomId), options);
      
      return res.status(200).json({
        success: true,
        count : conversation.length,
        conversation,
      });
    
}),

// @desc      Mark conversation as read
// @route     PUT /api/v1/chats/:roomId/mark-read
// @access    Private
markConversationReadByRoomId : asyncHandler(async (req, res) => {
    
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
    
  })
}
