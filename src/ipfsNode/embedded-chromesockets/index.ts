// Not in use, there was an error with the http so i decided to use IPFS companion.
// i'd love to ue sockets since make much more sense on the phone

import { Options } from "@src/typings/ipfs-types";

import Ipfs from "ipfs";
import { buildConfig } from "../config";

export async function init(opts: Options): Promise<Ipfs> {
    const ipfsOpts = await buildConfig(opts);

    const node = await Ipfs.create(ipfsOpts);
    // console.log(JSON.stringify(await node.config.get()));
    // HttpApi is off in browser context and needs to be started separately
    // not doing that now. ise ipfs companion
    // try {
    //     const httpServers = new HttpApi(node, ipfsOpts);
    //     nodeHttpApi = await httpServers.start();
    //     console.log(nodeHttpApi);
    //     return node;
    // } catch (err) {
    //     throw new Error(err);
    // }

    return node;
}
