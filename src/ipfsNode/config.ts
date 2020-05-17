import { Options } from "@src/typings/ipfs";

export const IPFS_DEFAULT_OPTS: Options = {
  start: true,
  offline: false,
  preload: {
    enabled: false,
    addresses: [],
  },
  EXPERIMENTAL: {
    ipnsPubsub: true, //default false
    sharding: true, //default false
  },
  config: {
    Addresses: {
      Swarm: [
        // "/ip4/0.0.0.0/tcp/4500",
        // "/ip6/2001::2851:7ae4:388e:866:da7a:e895/tcp/4042",
        // "/ip4/172.18.0.113/tcp/4042",
        // "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
      ],
      // API: "/ip4/0.0.0.0/tcp/5003",
      // Gateway: "/ip4/0.0.0.0/tcp/9091",
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
    ],
  },
};

export async function buildConfig(opts: Options) {
  const defaultOpts = Object.assign({}, IPFS_DEFAULT_OPTS, opts);

  // for now return default. takes 2sec with the config below, mainly goes to ipv4 and ipv6 resolving, we can do that later
  return defaultOpts;
}
