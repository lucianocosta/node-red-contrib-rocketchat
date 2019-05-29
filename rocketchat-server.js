module.exports = function (RED) {
  'use strict';

  function RocketChatServer(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.user = n.user;
  }

  RED.nodes.registerType('rocketchat-server', RocketChatServer, {
    credentials: {
      password: {type: 'password'}
    }
  });

};
