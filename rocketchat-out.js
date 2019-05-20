module.exports = function (RED) {
  "use strict";

  function RocketChatOut(n) {
    RED.nodes.createNode(this, n);
    const node = this;
    let host = n.host.replace("http://", "").replace("https://", "");
    const RocketChatApi = require('./rocket-chat').RocketChatApi;
    const rocketChatApi = new RocketChatApi('http', host, n.port, n.user, this.credentials.password, "v1");

    node.on('input', function (msg) {
      rocketChatApi.getPublicRooms(function (err, body) {
        if (!err) {
          node.status({fill: "blue", shape: "dot", text: "Connected"});
          let rooms = body.channels.filter(f => f.name == n.room);
          if (rooms.length === 1) {
            rocketChatApi.sendMsg(rooms[0]._id, msg.payload, function () {
              node.send(msg);
            });
          } else {
            node.status({fill: "red", shape: "ring", text: "Error:" + err});
          }
        } else {
          node.status({fill: "red", shape: "ring", text: "Error:" + err});
        }
      });
    });
  }

  RED.nodes.registerType("rocketchat-out", RocketChatOut, {
    credentials: {
      password: {type: "password"}
    }
  });
}
