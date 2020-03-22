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
import { ICollection } from "@src/interfaces";
import { addFileToIPFS, createCID, calculateHash } from "@src/ipfsNode/helpers";
import { withStore } from "@src/databases/OrbitDB";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import React, { SyntheticEvent, useEffect, useState } from "react";
import {
  addToCollection,
  saveLink,
  createPageInstance,
  getPageTitle,
  toDocument,
  createLink,
} from "../Links/helpers";
import Links from "../Links/Links";

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

  const store = withStore("collections");
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

  async function loadCollection() {
    console.debug("Loading collection ", id);
    const r = await store.get(id);
    // console.log(r[0], collection.links);
    setCollection(r[0]);
  }

  async function handleAddLink() {
    const url = prompt("Please enter the URL");

    if (VALID_URL_REGEX.test(url)) {
      const snackKey = enqueueSnackbar("Saving link ...", {
        varian: "info",
        persist: true,
      });

      const doc = await createPageInstance(url);
      const docObj = toDocument(doc);
      const title = getPageTitle(docObj);
      const ipfsPath = await addFileToIPFS(`${title}.html`, doc);

      const hash = await calculateHash(url);

      const l = await createLink({
        createdAt: Date.now(),
        hash,
        title,
        url,
        ipfs: ipfsPath,
      });

      await saveLink(l);

      console.time(`Adding link, hash ${hash}, to collection`);
      await addToCollection(hash, collection);
      console.timeEnd(`Adding link, hash ${hash}, to collection`);

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

    console.debug("Renaming collection", collection._id);
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
      <Links links={collection.links} />
    </div>
  );
}

export default Collection;
