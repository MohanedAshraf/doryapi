let users = [];

class WebSockets {

  connection(client) {
    console.log(users);
    // event fired when the chat room is disconnected
    client.on("disconnect", () => {
      console.log(users);
      users = users.filter((user) => user.socketId !== client.id);
    });
    // add identity of user mapped to the socket id
    client.on("identity", (userId) => {
      users.push({
        socketId: client.id,
        userId: userId,
      });
    });
    // subscribe person to chat & other user as well
    client.on("subscribe", (room, otherUserId = "") => {
      const userSockets = users.filter(
        (user) => user.userId === otherUserId
      );
      userSockets.map((userInfo) => {
        const socketConn = global.io.sockets.connected(userInfo.socketId);
        if (socketConn) {
          socketConn.join(room);
        }
      });
      client.join(room);
    });
    // mute a chat room
    client.on("unsubscribe", (room) => {
      client.leave(room);
    });
  }

}

export default new WebSockets();