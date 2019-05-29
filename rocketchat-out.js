module.exports = function (RED) {
  "use strict";

  function RocketChatOut(n) {
    RED.nodes.createNode(this, n);
    const node = this;
    const RocketChatApi = require('./rocket-chat').RocketChatApi;

    node.on('input', function (msg) {
      node.server = RED.nodes.getNode(n.server); // Retrieve the config node
      if (node.server.host.indexOf('http') < 0) {
        node.server.host = 'http://' + node.server.host;
      }
      let url;
      try {
        url = new URL(node.server.host);
      } catch (e) {
        node.error(e, msg);
      }
      let rocketChatApi = new RocketChatApi(url.protocol, url.hostname, url.port, node.server.user, node.server.credentials.password, "v1");
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

  RED.nodes.registerType("rocketchat-out", RocketChatOut);
}
