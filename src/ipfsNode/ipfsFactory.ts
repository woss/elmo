import { Options, Peer } from "@src/typings/ipfs";
import Ipfs from "ipfs";
import { difference, isEmpty, isNil, uniq } from "ramda";
import toMultiaddr from "uri-to-multiaddr";
import { IIPFSInstance } from "../interfaces";
import { buildConfig } from "./config";

let nodes: IIPFSInstance[] = [];

/**
 * Init the IPFS node
 * @param opts
 */
export async function init(opts: Options): Promise<Ipfs> {
  const ipfsOpts = await buildConfig(opts);
  const node = await Ipfs.create(ipfsOpts);

  return node;
}

export async function startIpfsNode(
  opts: Options = {},
  returnFirst = true,
): Promise<IIPFSInstance> {
  if (!isEmpty(nodes) && returnFirst) {
    const firstNode = nodes[0];

    return firstNode;
  } else {
    try {
      console.time("IPFS:: Start");
      const ipfs = await init(opts);
      console.timeEnd("IPFS:: Start");

      // const version = await ipfs.version();

      // if (version.version !== "0.40.0") {
      //   throw new Error(
      //     `IPFS version miss-match. Wanted "0.40.0" got ${version.version}`,
      //   );
      // }

      const node = await ipfs.id();
      const fullInstance = {
        ipfs,
        isIpfsReady: Boolean(ipfs),
        id: node.id,
      };
      nodes.push(fullInstance);
      console.debug(`IPFS ID: ${node.id}`);

      return fullInstance;
    } catch (error) {
      console.error("IPFS init error:", error);

      return { ipfs: null, isIpfsReady: false, error, id: "" };
    }
  }
}

export function useIpfsNode(id?: string): IIPFSInstance {
  if (id) {
    console.log("return specific node");
  } else {
    if (!isEmpty(nodes)) {
      return nodes[0];
    } else {
      throw new Error("No connected IPFS nodes.");
    }
  }
}

export async function cleanup() {
  return nodes.map(async (node, k) => {
    console.debug("Stopping IPFS");
    try {
      await node.ipfs.stop();
      delete nodes[k];
    } catch (e) {
      console.error(e);
    }
  });
}

export async function startMultipleIpfsNodes(
  amount: number,
): Promise<IIPFSInstance[]> {
  console.error(
    "startMultipleIpfsNodes is not fully supported, use at your own risk",
  );
  const promisedNodes: Promise<IIPFSInstance>[] = [];
  for (let i = 1; i <= amount; i++) {
    promisedNodes.push(
      startIpfsNode(
        {
          repo: `ipfs-${i}`,
        },
        false,
      ),
    );
  }
  return Promise.all(promisedNodes).then(n => {
    nodes = n;
    return nodes;
  });
}

export async function connectToExternal({
  api,
  gateway,
}: {
  api: string;
  gateway: string;
}): Promise<any> {
  console.log("connecting to other external", api, gateway);
  const newConfig = await buildConfig({
    config: {
      Addresses: {
        API: toMultiaddr(api),
        Gateway: toMultiaddr(gateway),
      },
    },
  });
  stop();
  return await startIpfsNode(newConfig);
}

/**
 * Poll the list of the connected peers
 * @param callback
 * @param interval
 */
export async function listenOnPeers(
  callback?: (p: Peer[]) => {},
  interval = 1000,
) {
  const { ipfs } = useIpfsNode();
  let peers: Peer[] = [];

  async function tick() {
    const newPeers = await ipfs.swarm.peers();
    peers = uniq(newPeers);
    const diff = difference(newPeers, peers);
    if (diff.length > 0) {
      console.log(
        "New peer(s) connected",
        diff.map(d => d.peer),
      );

      if (!isNil(callback)) {
        callback(peers);
      }
    }
  }

  const id = setInterval(tick, interval);
  return id;
}
