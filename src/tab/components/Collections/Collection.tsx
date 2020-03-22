import { IconButton, InputBase, Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import AddIcon from "@material-ui/icons/Add";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import ShareIcon from "@material-ui/icons/Share";
import { withStore, DB_NAME_COLLECTIONS } from "@src/databases/OrbitDB";
import { ICollection } from "@src/interfaces";
import { createCID } from "@src/ipfsNode/helpers";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { addToCollection, downloadAndSaveLink } from "../Links/helpers";
import Links from "../Links/Links";
import { browser } from "webextension-polyfill-ts";
import { isEmpty } from "ramda";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    display: "flex",
    justifyItems: "center",
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    // padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create("width"),
    width: "100%",
    // [theme.breakpoints.up("xl")]: {
    //     width: 200,
    // },
  },
  button: {
    color: "inherit",
  },
  createdAt: {
    paddingLeft: theme.spacing(2),
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonSuccess: {
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: "absolute",
    width: theme.spacing(8),
    height: theme.spacing(8),
    zIndex: 1,
  },
}));
interface Props {
  id: string;
  forceReload: boolean;
}

const VALID_URL_REGEX = /^(ftp|http|https|file):\/\/[^ "]+$/;

function Collection({ id, forceReload }: Props) {
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const store = withStore(DB_NAME_COLLECTIONS);
  const defaultCollection: ICollection = {
    _id: "",
    createdAt: 0,
    hash: "",
    links: [],
    title: "",
    workspaces: [],
  };
  const [collection, setCollection] = useState(defaultCollection);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = React.useState(false);
  const [links, setLinks] = React.useState([] as string[]);

  async function loadCollection() {
    // don;t forget to load the store from disk
    await store.load();
    const r = await store.get(id);

    setCollection(r[0]);
    setLinks(r[0].links);
  }

  async function handleAddLink() {
    const url = prompt("Please enter the URL");

    if (VALID_URL_REGEX.test(url)) {
      const snackKey = enqueueSnackbar("Saving link ...", {
        varian: "info",
        persist: true,
      });

      const { hash } = await downloadAndSaveLink(url);
      await addToCollection(hash, collection);
      await loadCollection();

      closeSnackbar(snackKey);
    } else {
      // we have the url but it's invalid, don't show if user clicks on cancel
      if (url) {
        enqueueSnackbar("Incorrect or empty URL", { variant: "error" });
      }
    }
  }
  function handleShareCollection() {
    console.log("share collection");
  }

  async function handleDelete(): Promise<void> {
    const r = confirm("SRSLY?");
    if (r === true) {
      await store.del(collection._id);
    }
  }

  function handleTitleChange(e) {
    const t = e.target.value;
    setCollection({
      ...collection,
      title: t,
    });
  }

  async function handleTitleSave(e: SyntheticEvent): Promise<void> {
    e.preventDefault();
    const hash = await createCID(collection.title.trim());
    if (hash === collection.hash) return null;

    if (saving) return null;

    setSaving(true);

    console.time(`Renaming collection ${collection._id}`);
    await store.put(
      {
        ...collection,
        hash,
      },
      { pin: true },
    );
    console.timeEnd(`Renaming collection ${collection._id}`);
    setSuccess(true);
    setSaving(false);

    setTimeout(() => setSuccess(false), 3000);
  }

  useEffect(() => {
    loadCollection();
  }, []);

  useEffect(() => {
    async function onIncomingRuntimeMessage(r) {
      // we must check that current collection is the only one that needs to make changes

      if (r.payload.collection._id === collection._id) {
        console.log(`COLLECTIONS:: action ${r.action}`, r.payload);
        switch (r.action) {
          case "newLink":
            await loadCollection();
            break;

          default:
            break;
        }
      }
    }
    if (!isEmpty(collection._id)) {
      browser.runtime.onMessage.addListener(onIncomingRuntimeMessage);
      return () => {
        browser.runtime.onMessage.removeListener(() => console.log("removed"));
      };
    }
  }, [collection]);

  useEffect(() => {
    if (forceReload) {
      console.log("got force reload");
      loadCollection();
    }
  }, [forceReload]);

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
    [classes.button]: true,
  });

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4" component="h4" className={classes.title}>
            <form onSubmit={handleTitleSave}>
              <InputBase
                id="title"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                value={collection.title}
                onBlur={handleTitleSave}
                onChange={handleTitleChange}
                fullWidth
                color="secondary"
              />
            </form>
          </Typography>
          <div className={classes.grow} />
          <div>
            <IconButton
              aria-label="save"
              color="primary"
              className={buttonClassname}
            >
              {saving && <CircularProgress className={classes.fabProgress} />}
              {success ? <CheckIcon /> : <SaveIcon />}
            </IconButton>

            <IconButton
              id="add-link"
              onClick={handleAddLink}
              className={classes.button}
              aria-label="add link"
            >
              <AddIcon />
            </IconButton>
            <IconButton
              id="share-collection"
              onClick={handleShareCollection}
              className={classes.button}
              aria-label="share"
            >
              <ShareIcon />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              className={classes.button}
              aria-label="delete"
              variant="contained"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Lets show the links */}
      <Links links={links} />
    </div>
  );
}

export default Collection;
