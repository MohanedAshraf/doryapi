import mongoose from 'mongoose'

const readByRecipientSchema = new mongoose.Schema(
  {
    _id: false,
    readByUserId: String,
    readAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    timestamps: false
  }
)

const MessageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    message: String,
    postedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    readByRecipients: [readByRecipientSchema]
  },
  {
    timestamps: true,
    collection: 'messages'
  }
)

/**
 * This method will create a post in chat
 *
 * @param {String} roomId - id of chat room
 * @param {Object} message - message you want to post in the chat room
 * @param {String} postedByUser - user who is posting the message
 * @param {String} role - user role
 */
MessageSchema.statics.createPostInChatRoom = async function (
  chatRoomId,
  message,
  postedByUser,
  role
) {
  try {
    const post = await this.create({
      chatRoomId,
      message,
      postedByUser,
      readByRecipients: { readByUserId: postedByUser }
    })

    if (role === 'user') {
      return this.aggregate([
        // get post where _id = post._id
        { $match: { _id: post._id } },
        // do a join on another table called users, and
        // get me a user whose _id = postedByUser
        {
          $lookup: {
            from: 'users',
            localField: 'postedByUser',
            foreignField: '_id',
            as: 'postedByUser'
          }
        },

        { $unwind: '$postedByUser' },
        // do a join on another table called chatrooms, and
        // get me a chatroom whose _id = chatRoomId
        {
          $lookup: {
            from: 'rooms',
            localField: 'chatRoomId',
            foreignField: '_id',
            as: 'chatRoomInfo'
          }
        },
        { $unwind: '$chatRoomInfo' },
        { $unwind: '$chatRoomInfo.userIds' },

        // do a join on another table called users, and
        // get me a user whose _id = userIds
        {
          $lookup: {
            from: 'doctors',
            localField: 'chatRoomInfo.userIds',
            foreignField: '_id',
            as: 'chatRoomInfo.userProfile'
          }
        },

        { $unwind: '$chatRoomInfo.userProfile' },

        // group data
        {
          $group: {
            _id: '$chatRoomInfo._id',
            postId: { $last: '$_id' },
            message: { $last: '$message' },
            postedByUser: { $last: '$postedByUser' },
            readByRecipients: { $last: '$readByRecipients' },
            chatRoomInfo: { $addToSet: '$chatRoomInfo.userProfile' },
            createdAt: { $last: '$createdAt' },
            updatedAt: { $last: '$updatedAt' }
          }
        }
      ])
    } else {
      return this.aggregate([
        // get post where _id = post._id
        { $match: { _id: post._id } },
        // do a join on another table called users, and
        // get me a user whose _id = postedByUser
        {
          $lookup: {
            from: 'doctors',
            localField: 'postedByUser',
            foreignField: '_id',
            as: 'postedByUser'
          }
        },

        { $unwind: '$postedByUser' },
        // do a join on another table called chatrooms, and
        // get me a chatroom whose _id = chatRoomId
        {
          $lookup: {
            from: 'rooms',
            localField: 'chatRoomId',
            foreignField: '_id',
            as: 'chatRoomInfo'
          }
        },
        { $unwind: '$chatRoomInfo' },
        { $unwind: '$chatRoomInfo.userIds' },

        // do a join on another table called users, and
        // get me a user whose _id = userIds
        {
          $lookup: {
            from: 'users',
            localField: 'chatRoomInfo.userIds',
            foreignField: '_id',
            as: 'chatRoomInfo.userProfile'
          }
        },

        { $unwind: '$chatRoomInfo.userProfile' },

        // group data
        {
          $group: {
            _id: '$chatRoomInfo._id',
            postId: { $last: '$_id' },
            message: { $last: '$message' },
            postedByUser: { $last: '$postedByUser' },
            readByRecipients: { $last: '$readByRecipients' },
            chatRoomInfo: { $addToSet: '$chatRoomInfo.userProfile' },
            createdAt: { $last: '$createdAt' },
            updatedAt: { $last: '$updatedAt' }
          }
        }
      ])
    }
  } catch (error) {
    throw error
  }
}

/**
 * @param {String} chatRoomId - chat room id
 * @param {String} role - user role
 */
MessageSchema.statics.getConversationByRoomId = async function (
  chatRoomId,
  options = {},
  role
) {
  try {
    return this.aggregate([
      { $match: { chatRoomId } },
      { $sort: { createdAt: -1 } },

      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } }
    ])
  } catch (error) {
    throw error
  }
}

/**
 * @param {String} chatRoomId - chat room id
 * @param {String} currentUserOnlineId - user id
 */
MessageSchema.statics.markMessageRead = async function (
  chatRoomId,
  currentUserOnlineId
) {
  try {
    return this.updateMany(
      {
        chatRoomId,
        'readByRecipients.readByUserId': { $ne: currentUserOnlineId }
      },
      {
        $addToSet: {
          readByRecipients: { readByUserId: currentUserOnlineId }
        }
      },
      {
        multi: true
      }
    )
  } catch (error) {
    throw error
  }
}

/**
 * @param {Array} chatRoomIds - chat room ids
 * @param {{ page, limit }} options - pagination options
 * @param {String} currentUserOnlineId - user id
 * @param {String} role - user role
 */
MessageSchema.statics.getRecentConversation = async function (
  chatRoomIds,
  options,
  currentUserOnlineId,
  role
) {
  try {
    if (role === 'user') {
      return this.aggregate([
        { $match: { chatRoomId: { $in: chatRoomIds } } },
        {
          $group: {
            _id: '$chatRoomId',
            messageId: { $last: '$_id' },
            chatRoomId: { $last: '$chatRoomId' },
            message: { $last: '$message' },
            postedByUser: { $last: '$postedByUser' },
            createdAt: { $last: '$createdAt' },
            readByRecipients: { $last: '$readByRecipients' }
          }
        },

        // do a join on another table called users, and
        // get me a user whose _id = postedByUser
        {
          $lookup: {
            from: 'users',
            localField: 'postedByUser',
            foreignField: '_id',
            as: 'postedByUser'
          }
        },
        { $unwind: '$postedByUser' },
        // do a join on another table called chatrooms, and
        // get me room details
        {
          $lookup: {
            from: 'rooms',
            localField: '_id',
            foreignField: '_id',
            as: 'roomInfo'
          }
        },
        { $unwind: '$roomInfo' },
        { $unwind: '$roomInfo.userIds' },
        // do a join on another table called users
        {
          $lookup: {
            from: 'users',
            localField: 'roomInfo.userIds',
            foreignField: '_id',
            as: 'roomInfo.userProfile'
          }
        },
        { $unwind: '$roomInfo.userProfile' },
        { $unwind: '$readByRecipients' },
        // do a join on another table called users
        {
          $lookup: {
            from: 'users',
            localField: 'readByRecipients.readByUserId',
            foreignField: '_id',
            as: 'readByRecipients.readByUser'
          }
        },

        {
          $group: {
            _id: '$roomInfo._id',
            messageId: { $last: '$messageId' },
            chatRoomId: { $last: '$chatRoomId' },
            message: { $last: '$message' },
            postedByUser: { $last: '$postedByUser' },
            readByRecipients: { $addToSet: '$readByRecipients' },
            roomInfo: { $addToSet: '$roomInfo.userProfile' },
            createdAt: { $last: '$createdAt' }
          }
        },
        { $sort: { createdAt: -1 } },
        // apply pagination
        { $skip: options.page * options.limit },
        { $limit: options.limit }
      ])
    } else {
      return this.aggregate([
        { $match: { chatRoomId: { $in: chatRoomIds } } },
        {
          $group: {
            _id: '$chatRoomId',
            messageId: { $last: '$_id' },
            chatRoomId: { $last: '$chatRoomId' },
            message: { $last: '$message' },
            postedByUser: { $last: '$postedByUser' },
            createdAt: { $last: '$createdAt' },
            readByRecipients: { $last: '$readByRecipients' }
          }
        },

        // do a join on another table called users, and
        // get me a user whose _id = postedByUser
        {
          $lookup: {
            from: 'doctors',
            localField: 'postedByUser',
            foreignField: '_id',
            as: 'postedByUser'
          }
        },
        { $unwind: '$postedByUser' },
        // do a join on another table called chatrooms, and
        // get me room details
        {
          $lookup: {
            from: 'rooms',
            localField: '_id',
            foreignField: '_id',
            as: 'roomInfo'
          }
        },
        { $unwind: '$roomInfo' },
        { $unwind: '$roomInfo.userIds' },
        // do a join on another table called users
        {
          $lookup: {
            from: 'users',
            localField: 'roomInfo.userIds',
            foreignField: '_id',
            as: 'roomInfo.userProfile'
          }
        },
        { $unwind: '$roomInfo.userProfile' },
        { $unwind: '$readByRecipients' },
        // do a join on another table called users
        {
          $lookup: {
            from: 'users',
            localField: 'readByRecipients.readByUserId',
            foreignField: '_id',
            as: 'readByRecipients.readByUser'
          }
        },

        {
          $group: {
            _id: '$roomInfo._id',
            messageId: { $last: '$messageId' },
            chatRoomId: { $last: '$chatRoomId' },
            message: { $last: '$message' },
            postedByUser: { $last: '$postedByUser' },
            readByRecipients: { $addToSet: '$readByRecipients' },
            roomInfo: { $addToSet: '$roomInfo.userProfile' },
            createdAt: { $last: '$createdAt' }
          }
        },

        { $sort: { createdAt: -1 } },
        // apply pagination
        { $skip: options.page * options.limit },
        { $limit: options.limit }
      ])
    }
  } catch (error) {
    throw error
  }
}

export default mongoose.model('Message', MessageSchema)
