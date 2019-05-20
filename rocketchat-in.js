module.exports = function (RED) {
  "use strict";

  function RocketChatIn(n) {
    RED.nodes.createNode(this, n);
    const node = this;
    const RocketChatApi = require('./rocket-chat').RocketChatApi;
    let previous_time = Date.parse(new Date());

    node.on('input', function (msg) {
      let host = n.host.replace("http://","").replace("https://","");
      let rocketChatApi = new RocketChatApi('http', host, n.port, n.user, this.credentials.password, "v1");

      rocketChatApi.getPublicRooms(function (err, body) {
        if (!err) {
          node.status({fill: "blue", shape: "dot", text: "Connected"});
          let rooms = body.channels.filter(f => f.name == n.room);
          if (rooms.length === 1) {
            rocketChatApi.getUnreadMsg(rooms[0]._id, function (err2, body2) {
              if (!err2) {
                let ts_max = previous_time;
                for (let i=0, j=body2.messages.length; i<j; i++) {
                  let ts = Date.parse(body2.messages[i].ts);
                  if (ts > previous_time) {
                    node.send({payload: body2.messages[i].msg});
                  }
                  ts_max = Math.max(ts_max, ts);
                }
                previous_time = ts_max;
              } else {
                node.error(err2);
                node.status({fill: "red", shape: "ring", text: "Error: " + err2});
              }
            });
          } else {
            let e = "Rocket.Chat room not found: " + n.room;
            node.error(e, msg);
            node.status({fill: "red", shape: "ring", text: "Error: " + e});
          }
        } else {
          node.error("Failed to get Rocket.Chat public rooms.", err);
          node.status({fill: "red", shape: "ring", text: "Error: " + err});
        }
      });
    });
  }

  RED.nodes.registerType("rocketchat-in", RocketChatIn, {
    credentials: {
      password: {type: "password"}
    }
  });

};
