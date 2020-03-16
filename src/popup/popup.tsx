import React, { FunctionComponent, useState, useEffect } from "react";

import { browser, Tabs } from "webextension-polyfill-ts";
import { makeStyles, CssBaseline, Fade } from "@material-ui/core";
import { startIpfsNode } from "@src/ipfsNode/ipfsFactory";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  startOrbitDBInstance,
  createDbs,
  createDefaultDbs,
} from "@src/OrbitDB/OrbitDB";
import PopupCollections from "@src/tab/components/Collections/PopupCollections";

const useStyles = makeStyles(theme => ({
  root: {
    width: 300,
    minHeight: 100,
  },
  flex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));
export const Popup: FunctionComponent = () => {
  const classes = useStyles();
  const [ready, setReady] = useState(false);
  const preferRemote = JSON.parse(localStorage.getItem("preferRemote"));
  useEffect(() => {
    browser.runtime.sendMessage({ popupMounted: true });
    // this is the way to get the current tab

    startIpfsNode().then(r => {
      startOrbitDBInstance().then(d => {
        if (preferRemote) {
          const dbs = JSON.parse(localStorage.getItem("remoteDatabases"));
          createDbs(dbs).then(d => {
            console.log("Remote dbs loaded");
            setTimeout(() => setReady(true), 200);
          });
        } else {
          createDefaultDbs().then(d => {
            // console.log(d);

            console.log("Default dbs loaded");

            setTimeout(() => setReady(true), 200);
          });
        }
      });
    });
  }, []);

  if (!ready) {
    return (
      <Fade in={!ready}>
        {/* <CssBaseline /> */}
        <div className={[classes.root, classes.flex].join(" ")}>
          <CircularProgress />
        </div>
      </Fade>
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
