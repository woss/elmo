import React, { useEffect, useState } from "react";

import useIpfs from "@src/hooks/use-ipfs";

interface Props {
    ipfs: any;
}
export const IpfsInfo = ({ ipfs }: Props) => {
    if (!ipfs) return null;

    const node = useIpfs(ipfs, "id");
    const isOnline = useIpfs(ipfs, "isOnline");
    const bootstrapList = useIpfs(ipfs, "bootstrap.list");

    return (
        <div className="">
            <h1 className="" data-test="title">
                Connected to IPFS
            </h1>
            <div className="pa4">
                <ul>
                    <li>Peer ID: {node && node.id}</li>
                    <li>Addresses: {node && node.addresses.join(",")}</li>
                    <li>Online: {JSON.stringify(isOnline)}</li>
                    <li>
                        Peers:{" "}
                        <ul>
                            {bootstrapList
                                ? bootstrapList.Peers.map((v, k) => {
                                      return <li key={k}>{v}</li>;
                                  })
                                : ""}
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    );
};
export default IpfsInfo;
