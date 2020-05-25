import { useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import { Peer } from "@src/typings/ipfs";
import dotProp from "dot-prop";
import { difference, isNil } from "ramda";
import { useEffect, useRef, useState } from "react";

/*
 * Pass the command you'd like to call on an ipfs instance.
 *
 * Uses setState to capture the response, so your component
 * will re-render when the result turns up.
 *
 */

async function callIpfs(cmd, opts, setRes?) {
  const { ipfs } = useIpfsNode();
  if (!ipfs) return null;
  // console.log(`Call ipfs.${cmd}`);
  const ipfsCmd = dotProp.get(ipfs, cmd) as any;
  const res = await ipfsCmd(opts);
  // console.log(`Result ipfs.${cmd}`, res);

  if (isNil(setRes)) {
    return res;
  } else {
    setRes(res);
  }
}

export default function useIpfsEffect(cmd, opts?) {
  const { ipfs } = useIpfsNode();
  const [res, setRes] = useState(null);
  useEffect(() => {
    callIpfs(cmd, opts, setRes);
  }, [ipfs, cmd, opts]);
  return res;
}

export async function useIpfs(cmd, opts?): Promise<any> {
  return callIpfs(cmd, opts);
}

/**
 * Swarm peers effect with the Interval
 * @param callback
 * @param interval
 */
export function useSwarmPeersEffect(callback, interval = 1000) {
  const { ipfs } = useIpfsNode();
  const savedCallback = useRef((p: Peer[]) => {
    return p;
  });

  let peers: Peer[] = [];

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    async function tick() {
      const newPeers = await ipfs.swarm.peers();
      const diff = difference(newPeers, peers);
      if (diff.length > 0) {
        console.log(
          "New peer(s) connected",
          diff.map(d => d.peer),
        );
        peers = newPeers;
        savedCallback.current(peers);
      }
    }

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval]);
}
