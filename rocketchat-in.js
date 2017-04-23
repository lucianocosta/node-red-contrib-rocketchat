module.exports = function(RED) {
    "use strict";
    function RocketChatIn(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var previous_time = Date.parse(new Date());
        var RocketChatApi = require('./rocket-chat').RocketChatApi;
        var rocketChatApi = new RocketChatApi('http', this.credentials.host, this.credentials.port, this.credentials.user, this.credentials.password, "v1");
        setInterval(function() {
            rocketChatApi.getPublicRooms(function(err, body) {
                if(!err) {
                    node.status({fill: "blue", shape: "dot", text: "Connected"});
                    for (var i = 0; i < body.channels.length; i++) {
                        var roomId = body.channels[i]._id;
                        rocketChatApi.getUnreadMsg(roomId, function(err2, body2) {
                            if(!err2) {
                                var ts_max = previous_time;
                                for (var j = 0; j < body2.messages.length; j++) {
                                    var ts = Date.parse(body2.messages[j].ts);
                                    if (ts > previous_time) {
                                        var msg = { payload: body2.messages[j].msg };
                                        console.log("payload=" + msg.payload);
                                        node.send(msg);
                                    }
                                    ts_max = Math.max(ts_max, ts);
                                }
                                previous_time = ts_max;
                            }
                            else
                            {
                                console.log(err2);
                                node.status({fill: "red", shape: "ring", text: "Error:" + err2});
                            }
                        });
                    }
                }
                else
                {
                    console.log(err);
                    node.status({fill: "red", shape: "ring", text: "Error:" + err});
                }
            });
        }, 1000);

        //this.on('input', function (msg) {
            //node.warn("I saw a payload: " + msg.payload);
            //node.send(msg);
        //});
    }

    RED.nodes.registerType("rocketchat-in", RocketChatIn,
    {
        credentials: {
            host: {
                type: "password"
            },
            port: {
                type: "password"
            },
            user: {
                type: "password"
            },
            password: {
                type: "password"
            }
        }
    });
}
