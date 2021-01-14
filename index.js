"use strict";
const TCP = require("libp2p-tcp");
const Websockets = require("libp2p-websockets");
const WebRTCStar = require("libp2p-webrtc-star");
const wrtc = require("wrtc");
const Mplex = require("libp2p-mplex");
const { NOISE } = require("libp2p-noise");
const ChatProtocol = require("./chat_handler");
const Libp2p = require("libp2p");

(async () => {
  const node = await Libp2p.create({
    addresses: {
      listen: [
        "/ip4/0.0.0.0/tcp/0",
        "/ip4/0.0.0.0/tcp/0/ws",
        `/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/`,
      ],
    },
    modules: {
      transport: [TCP, Websockets, WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
    },
    config: {
      transport: {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc,
        },
      },
    },
  });
  await node.start();
  console.log(`Your peerID:${node.peerId.toB58String()}`);
  node.connectionManager.on("peer:connect", (connection) => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}!`);
  });

  node.handle(ChatProtocol.PROTOCOL, ChatProtocol.handler);

  process.stdin.on("data", (message) => {
    message = message.slice(0, -1);
    node.peerStore.peers.forEach(async (peerData) => {
      if (!peerData.protocols.includes(ChatProtocol.PROTOCOL)) return;

      const connection = node.connectionManager.get(peerData.id);
      if (!connection) return;

      try {
        const { stream } = await connection.newStream([ChatProtocol.PROTOCOL]);
        await ChatProtocol.send(message, stream);
      } catch (err) {
        console.error(
          "Could not negotiate chat protocol stream with peer",
          err
        );
      }
    });
  });
})();
