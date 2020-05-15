import { IIPFSInstance } from "../interfaces";
import { Options } from "@src/typings/ipfs";
import * as R from "ramda";
import Ipfs from "ipfs";
import { buildConfig } from "./config";
import toMultiaddr from "uri-to-multiaddr";

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
    if (!R.isEmpty(nodes) && returnFirst) {
        const firstNode = nodes[0];
        console.log("IPFS instance found. Returning first");
        return firstNode;
    } else {
        try {
            console.time("IPFS:: Start");
            const ipfs = await init(opts);
            console.timeEnd("IPFS:: Start");

            const version = await ipfs.version();

            if (version.version !== "0.40.0") {
                throw new Error(
                    `IPFS version miss-match. Wanted "0.40.0" got ${version.version}`,
                );
            }

            const node = await ipfs.id();
            const fullInstance = {
                ipfs,
                isIpfsReady: Boolean(ipfs),
                id: node.id,
            };
            nodes.push(fullInstance);
            console.log(`IPFS ID: ${node.id}`);

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
        if (!R.isEmpty(nodes)) {
            return nodes[0];
        } else {
            throw new Error("No connected IPFS nodes.");
        }
    }
}

export async function cleanup() {
    console.log("ipfs cleanup");
    return nodes.map(async (node, k) => {
        console.log("Stopping IPFS");
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
    console.log(
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
    await stop();
    console.log("ipfs stopped");
    return await startIpfsNode(newConfig);
}
