import Libp2p from "libp2p";
import Bootstrap from "libp2p-bootstrap";
import KadDHT from "libp2p-kad-dht";
import MulticastDNS from "libp2p-mdns";
import MPLEX from "libp2p-mplex";
import SECIO from "libp2p-secio";
import SPDY from "libp2p-spdy";
import TCP from "libp2p-tcp";

/**
 * Options for the libp2p bundle
 * @typedef {Object} libp2pBundle~options
 * @property {PeerInfo} peerInfo - The PeerInfo of the IPFS node
 * @property {PeerBook} peerBook - The PeerBook of the IPFS node
 * @property {Object} config - The config of the IPFS node
 * @property {Object} options - The options given to the IPFS node
 */

/**
 * This is the bundle we will use to create our fully customized libp2p bundle.
 *
 * @param {libp2pBundle~options} opts The options to use when generating the libp2p node
 * @returns {Libp2p} Our new libp2p node
 */
export const libp2pBundle = (opts) => {
  // Set convenience variables to clearly showcase some of the useful things that are available
  const peerInfo = opts.peerInfo;
  const peerBook = opts.peerBook;
  const bootstrapList = opts.config.Bootstrap;

  // Build and return our libp2p node
  // n.b. for full configuration options, see https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md
  return new Libp2p({
    peerInfo,
    peerBook,
    // Lets limit the connection managers peers and have it check peer health less frequently
    connectionManager: {
      minPeers: 25,
      maxPeers: 100,
      pollInterval: 5000,
    },
    modules: {
      transport: [TCP],
      streamMuxer: [MPLEX, SPDY],
      connEncryption: [SECIO],
      peerDiscovery: [MulticastDNS, Bootstrap],
      dht: KadDHT,
    },
    config: {
      peerDiscovery: {
        autoDial: true, // auto dial to peers we find when we have less peers than `connectionManager.minPeers`
        mdns: {
          interval: 10000,
          enabled: true,
        },
        bootstrap: {
          interval: 30e3,
          enabled: true,
          list: bootstrapList,
        },
      },
      // Turn on relay with hop active so we can connect to more peers
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true,
        },
      },
      dht: {
        enabled: true,
        kBucketSize: 20,
        randomWalk: {
          enabled: true,
          interval: 10e3, // This is set low intentionally, so more peers are discovered quickly. Higher intervals are recommended
          timeout: 2e3, // End the query quickly since we're running so frequently
        },
      },
      pubsub: {
        enabled: true,
      },
    },
    // metrics: {
    //   enabled: true,
    //   computeThrottleMaxQueueSize: 1000, // How many messages a stat will queue before processing
    //   computeThrottleTimeout: 2000, // Time in milliseconds a stat will wait, after the last item was added, before processing
    //   movingAverageIntervals: [
    //     // The moving averages that will be computed
    //     60 * 1000, // 1 minute
    //     5 * 60 * 1000, // 5 minutes
    //     15 * 60 * 1000, // 15 minutes
    //   ],
    //   maxOldPeersRetention: 50, // How many disconnected peers we will retain stats for
    // },
  });
};
