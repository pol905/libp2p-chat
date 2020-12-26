const PeerId = require("peer-id");
const fs = require("fs-extra");
const createPeer = async () => {
  const id = await PeerId.create({ bits: 1024, keyType: "rsa" });

  fs.writeFileSync("./peer.json", JSON.stringify(id.toJSON(), null, 2));
};

createPeer();
