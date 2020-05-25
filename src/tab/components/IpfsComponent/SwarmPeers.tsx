import { makeStyles, Typography } from "@material-ui/core";
import { useSwarmPeersEffect } from "@src/ipfsNode/use-ipfs";
import { Peer } from "@src/typings/ipfs";
import React, { useState } from "react";
import CustomList from "../Shared/CustomList";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    // maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: theme.spacing(2, 0, 2),
  },
  text: {
    overflowWrap: "anywhere",
  },
}));

export default function SwarmPeers() {
  const classes = useStyles();

  const [peers, setPeers] = useState([] as Peer[]);

  useSwarmPeersEffect((p: Peer[]) => {
    setPeers(p);
  });

  function transformPeerToString(peer: Peer): string {
    if (peer.addr) {
      const addr = peer.addr.toString();
      if (addr.indexOf("ipfs") >= 0) {
        return addr;
      } else {
        return peer.peer;
      }
    } else {
      return "";
    }
  }
  return (
    <div className={classes.root}>
      <Typography variant="h6">Connected Peers: {peers.length}</Typography>
      <CustomList
        data={peers}
        classes={classes}
        transformValue={transformPeerToString}
      />
    </div>
  );
}
