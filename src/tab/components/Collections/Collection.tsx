import React, { useState, useEffect } from "react";
import { Typography, IconButton, InputBase, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import { ICollection } from "@src/interfaces";

import ShareIcon from "@material-ui/icons/Share";
import Links from "../Links/Links";
import { createCID, addFileToIPFS } from "@src/ipfsNode/helpers";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { useSnackbar } from "notistack";
import {
    createPageInstance,
    getPageTitle,
    createLink,
    calculateHash,
    addToCollection,
    toDocument,
} from "../Links/helpers";

import { withStore } from "@src/OrbitDB/OrbitDB";
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

            await createLink({
                createdAt: Date.now(),
                hash,
                title,
                url,
                ipfs: ipfsPath,
            });
            console.debug("Adding link to collection. Link hash :: ", hash);

            console.time("Add Link To Collection");
            await addToCollection(hash, collection);
            console.timeEnd("Add Link To Collection");

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
        var r = confirm("SRSLY?");
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

    async function handleTitleSave(): Promise<void> {
        const hash = await createCID(collection.title.trim());
        if (hash === collection.hash) return null;

        const k = enqueueSnackbar("Renaming collection ...", { persist: true });
        console.time("Renaming collection");
        await store.put(
            {
                ...collection,
                hash,
            },
            { pin: true },
        );
        console.timeEnd("Renaming collection");
        closeSnackbar(k);
    }

    async function loadCollection() {
        console.debug("Loading collection ", id);
        const r = await store.get(id);
        // console.log(r[0], collection
        setCollection(r[0]);
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

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h4"
                        component="h4"
                        className={classes.title}
                    >
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
                    </Typography>
                    <div className={classes.grow} />
                    <div>
                        <IconButton
                            onClick={handleDelete}
                            className={classes.button}
                            aria-label="delete"
                            variant="contained"
                        >
                            <DeleteIcon />
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
                    </div>
                </Toolbar>
            </AppBar>

            {/* Lets show the links */}
            <Links links={collection.links} />
        </div>
    );
}

export default Collection;
