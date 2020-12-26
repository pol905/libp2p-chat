const SignalingServer = require("libp2p-webrtc-star/src/sig-server");

signalingServer = async () => {
  return SignalingServer.start({
    port: 15555,
  });
};

module.exports = signalingServer;
