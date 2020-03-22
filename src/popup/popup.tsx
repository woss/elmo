import { Fade, makeStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import PopupCollections from "@src/tab/components/Collections/PopupCollections";
import React, { FunctionComponent, useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";
import clsx from "clsx";
const useStyles = makeStyles(() => ({
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

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <Fade in={!ready}>
        <div className={clsx(classes.root, classes.flex)}>
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
