import { useState, useEffect } from "react";
import dotProp from "dot-prop";
import { useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import { isUndefined } from "lodash";

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

  if (isUndefined(setRes)) {
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
