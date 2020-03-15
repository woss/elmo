import React, { FunctionComponent, useState, useEffect } from "react";

import { browser, Tabs } from "webextension-polyfill-ts";
import { makeStyles, CssBaseline, Fade } from "@material-ui/core";
import { startIpfsNode } from "@src/ipfsNode/ipfsFactory";
import { startOrbitDBInstance } from "@src/OrbitDB/OrbitDB";
import PopupCollections from "@src/tab/components/Collections/PopupCollections";

const useStyles = makeStyles(theme => ({
    root: {
        width: 300,
    },
    flex: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
    },
}));
export const Popup: FunctionComponent = () => {
    const classes = useStyles();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
        // this is the way to get the current tab

        startIpfsNode().then(r => {
            startOrbitDBInstance().then(d =>
                setTimeout(() => setReady(true), 200),
            );
        });
    }, []);

    if (!ready) {
        return (
            <div>
                <CssBaseline />
                <div className={classes.flex}>
                    <div>Warming up the app ....</div>{" "}
                </div>
            </div>
        );
    }
    // Renders the component tree
    return (
        <Fade in={ready}>
            <div className={classes.root}>
                <PopupCollections />
            </div>
        </Fade>
    );
};

export default Popup;
