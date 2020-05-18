import { Options } from "@src/typings/ipfs";

export const IPFS_DEFAULT_OPTS: Options = {
  start: true,
  offline: false, //Run ipfs node offline. The node does not connect to the rest of the network but provides a local API.

  preload: {
    enabled: true,
    addresses: [],
  },
  EXPERIMENTAL: {
    ipnsPubsub: false, //default false
    sharding: false, //default false
  },
  config: {
    Addresses: {
      Swarm: [
        // "/ip4/0.0.0.0/tcp/4500",
        // "/ip6/2001::2851:7ae4:388e:866:da7a:e895/tcp/4042",
        // "/ip4/172.18.0.113/tcp/4042",
        // "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
      ],
      API: "/ip4/0.0.0.0/tcp/5003",
      Gateway: "/ip4/0.0.0.0/tcp/9091",
      Delegates: [],
    },
    Discovery: {
      MDNS: {
        Enabled: true,
        Interval: 10,
      },
      webRTCStar: {
        Enabled: true,
      },
    },
    Pubsub: {
      Enabled: true,
    },
    Swarm: {
      ConnMgr: {
        LowWater: 200,
        HighWater: 500,
      },
    },

    Bootstrap: [
      // add these dynamically
      "/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
      "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
      "/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
      "/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
      "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
      "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
      "/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
      "/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6",
    ],
  },
};

export async function buildConfig(opts: Options) {
  const defaultOpts = Object.assign({}, IPFS_DEFAULT_OPTS, opts);

  // for now return default. takes 2sec with the config below, mainly goes to ipv4 and ipv6 resolving, we can do that later
  return defaultOpts;
}
