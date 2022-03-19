// const WStar = require("libp2p-webrtc-star");
// const multiaddr = require("multiaddr");
// const pipe = require("it-pipe");
// const { collect } = require("streaming-iterables");

// export const createInstance = async (id?: string) => {
//   const addr = multiaddr(
//     "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
//   );
//   const upgrader = {
//     upgradeInbound: maConn => console.log(maConn),
//     upgradeOutbound: maConn => console.log(maConn),
//   };

//   const ws = new WStar({ upgrader });

//   const listener = ws.createListener(socket => {
//     console.log("new connection opened");
//     pipe(["hello"], socket);
//   });

//   await listener.listen(addr);
//   console.log("listening");

//   setTimeout(async () => {
//     const socket = await ws.dial(addr);
//     const values = await pipe(socket, collect);

//     console.log(`Value: ${values.toString()}`);
//   }, 2000);

//   // Close connection after reading
//   // await listener.close();
// };

// // createInstance();
