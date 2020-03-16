import React, { Fragment, useEffect, useState } from "react";
import { ICollection } from "@src/interfaces";
import Collection from "./Collection";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";

import { Grid, Container } from "@material-ui/core";

import nanoid from "nanoid";
import { createCID } from "@src/ipfsNode/helpers";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

import { withStore, loadAllFromStore } from "@src/OrbitDB/OrbitDB";
import { useSnackbar } from "notistack";

const useStyles = makeStyles(theme => ({
  root: {},
  loading: {
    width: 300,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  fabButton: {
    position: "fixed",
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    zIndex: 1200,
  },
}));

function Collections() {
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const store = withStore("collections");
  // const linksDB = withStore("links");

  const [disabled, setDisabled] = useState(false);
  const [forceReload, setForceReload] = useState(false);
  const [collections, setCollections] = useState([] as ICollection[]);

  //get default values and make binding
  useEffect(() => {
    // must do this since we get false too

    store.events.on("write", async (dbname, event) => {
      console.debug("COLLECTIONS:: write", dbname, event);
      const _col: ICollection = event.payload.value;
      const idx = collections.findIndex(c => c._id === _col._id);
      if (idx !== -1) {
        const newCollections = collections;
        newCollections[idx] = _col;

        setCollections(newCollections);
      } else {
        const c = await loadAllFromStore("collections");
        setCollections(c);
      }
    });

    store.events.on("replicate", address => {
      console.debug("COLLECTIONS:: replication started", address);
    });
    store.events.on("replicated", async () => {
      console.debug("COLLECTIONS:: replicated");

      const c = await loadAllFromStore("collections");
      setCollections(c);
      setForceReload(true);
      // loadAllFromStore("collections").then(c => {});
    });
    // linksDB.events.on("replicate", address => {
    //     console.debug("LINKS :: replication started", address);
    // });
    // linksDB.events.on("replicated", () => {
    //     console.debug("LINKS::replicated ");
    //     loadAllFromStore("links")
    // });

    loadAllFromStore("collections").then(c => {
      setCollections(c);
    });
  }, []);

  async function handleAddCollection() {
    setDisabled(true);
    const collectionName = "Collection " + Math.round(Math.random() * 100);
    const snackKey = enqueueSnackbar(`Adding ${collectionName}`, {
      variant: "info",
      persist: true,
    });
    const collection: ICollection = {
      _id: nanoid(),
      hash: await createCID(collectionName),
      title: collectionName,
      links: [],
      sharedWith: [],
      // user: user._id,
      // workspaces: [currentWorkspace._id],
      createdAt: Date.now(),
    };

    try {
      console.time("Add collection");
      await store.put(collection, { pin: true });
      console.timeEnd("Add collection");

      closeSnackbar(snackKey);
      setDisabled(false);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e, {
        variant: "error",
      });
      setDisabled(false);
    }
  }

  if (!collections) {
    return (
      <div className={classes.loading}>
        <Skeleton />
        <Skeleton animation={false} />
        <Skeleton animation="wave" />
      </div>
    );
  }

  return (
    <div>
      <Grid container spacing={2} direction="column">
        {collections.map(({ _id }) => {
          return (
            <Grid item key={_id}>
              <Collection forceReload={forceReload} id={_id} />
            </Grid>
          );
        })}
      </Grid>
      <div className={classes.fabButton}>
        <Fab
          disabled={disabled}
          color="secondary"
          aria-label="Create Collection"
          className={classes.fabButton}
          onClick={handleAddCollection}
        >
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
}

export default Collections;
