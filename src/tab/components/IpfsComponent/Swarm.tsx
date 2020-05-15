import React, { useState, useEffect } from "react";
import { useIpfs } from "@src/ipfsNode/use-ipfs";
import { Peer } from "@src/typings/ipfs";

import { makeStyles, Typography } from "@material-ui/core";
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

export function SwarmPeers() {
    const classes = useStyles();

    const [intervalID, setIntervalID] = useState(null);
    const [peers, setPeers] = useState([] as Peer[]);

    function refreshPeers() {
        useIpfs("swarm.peers").then(peers => {
            setPeers(peers);
        });
    }

    useEffect(() => {
        refreshPeers();
    }, []);

    useEffect(() => {
        if (!intervalID) {
            const p = setInterval(refreshPeers, 7000);
            setIntervalID(p);
        }

        return () => {
            clearInterval(intervalID);
        };
    }, [peers]);

    function transformPeerToString(peer: Peer): string {
        if (peer.addr) {
            const addr = peer.addr.toString();
            if (addr.indexOf("ipfs") >= 0) {
                return addr;
            } else {
                return addr + peer.peer.id.toB58String();
            }
        } else {
            return "";
        }
    }
    return (
        <div className={classes.root}>
            <Typography variant="h6">
                Connected Peers: {peers.length}
            </Typography>
            <CustomList
                data={peers}
                classes={classes}
                transformValue={transformPeerToString}
            />
        </div>
    );
}
