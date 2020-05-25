import { listenOnPeers, useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import { Peer } from "@src/typings/ipfs";
import dotProp from "dot-prop";
import { isNil } from "ramda";
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
  const savedCallback = useRef((p: Peer[]) => {
    return p;
  });

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    let id = null;
    async function tick() {
      id = await listenOnPeers(savedCallback.current, interval);
    }
    tick();
    return () => clearInterval(id);
  }, [interval]);
}
