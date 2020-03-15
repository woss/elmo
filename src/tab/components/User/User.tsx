import React, { useState, SyntheticEvent, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { IUser, IWorkspace } from "@src/interfaces";
import { Typography, Button, Divider } from "@material-ui/core";
import nanoid from "nanoid";
import { createCID } from "@src/ipfsNode/helpers";
import { withStore } from "@src/OrbitDB/OrbitDB";

const useStyles = makeStyles(theme => ({
    root: {
        width: "80vw",
    },
    flex: {
        display: "flex",
        // alignItems: "center",
        // justifyContent: "center",
    },
    form: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(4),
        "& > *": {
            margin: theme.spacing(1),
        },
    },
    formContent: {
        "& > *": {
            margin: theme.spacing(1),
            width: 200,
        },
    },
    title: {
        padding: theme.spacing(3),
        width: "80vw",
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary["A100"],
    },
    saveButton: {
        width: "20vw",
        padding: 16,
        marginLeft: 25,
    },
}));

function User() {
    const classes = useStyles();
    const store = withStore("userStore");
    const workspaceStore = withStore("workspaceStore");

    const defaultState: IUser = {
        _id: "",
        name: "",
        hash: "",
        email: "",
        did: "",
        permissions: ["r", "w", "x"],
        createdAt: 0,
    };
    const [user, setUser] = useState(defaultState);

    const workspaceDefaults: IWorkspace = {
        _id: "",
        name: "",
        hash: "",
        current: true,
        private: true,
        sharedWith: [],
        createdAt: 0,
    };
    const [workspace, setWorkspace] = useState(workspaceDefaults);

    const handleFieldChange = e => {
        const val = e.target.value;
        const id = e.target.id;

        if (!val) return;
        setUser({ ...user, [id]: val });
    };

    const handleWorkspaceChange = e => {
        const val = e.target.value;

        if (!val) return;

        setWorkspace({ ...workspace, name: val.trim() });
    };

    async function handleSave(e) {
        e.preventDefault();
        if (!user) return null;

        const usr = await store.put(
            {
                ...user,
                hash: await createCID(user.email),
                _id: nanoid(),
            },
            { pin: true },
        );

        const wrkspc = await workspaceStore.put(
            {
                ...workspace,
                hash: await createCID(workspace.name.trim()),
                userHash: usr,
                current: true,
                _id: nanoid(),
                createdAt: Date.now(),
            },
            { pin: true },
        );
        console.log(wrkspc, usr);
    }

    async function loadUser() {
        const r: any[] = await store.get("");

        if (r.length === 1) setUser(r[0]);
    }

    useEffect(() => {
        if (store) loadUser();
    }, [store]);

    return (
        <div className={classes.root}>
            <form onSubmit={handleSave} className={classes.form}>
                <div className={classes.flex}>
                    <Typography className={classes.title} variant="h6">
                        Create youse 😁
                    </Typography>
                    <Button
                        type="submit"
                        className={classes.saveButton}
                        variant="contained"
                        color="primary"
                    >
                        Do it!!⚡
                    </Button>
                </div>
                <div className={classes.formContent}>
                    <TextField
                        id="name"
                        required
                        label="Name"
                        variant="outlined"
                        onChange={handleFieldChange}
                        value={user.name}
                    />
                    <TextField
                        id="email"
                        required
                        type="email"
                        label="Email"
                        variant="outlined"
                        onChange={handleFieldChange}
                        value={user.email}
                    />
                    <TextField
                        id="did"
                        label="DID"
                        variant="outlined"
                        placeholder="did:sen:1234567890"
                        onChange={handleFieldChange}
                        value={user.did || ""}
                    />
                </div>
                <Divider />
                <div className={classes.formContent}>
                    <TextField
                        id="workspace"
                        label="Workspace"
                        variant="outlined"
                        required
                        onChange={handleWorkspaceChange}
                        value={workspace.name}
                    />
                </div>
            </form>
        </div>
    );
}

export default User;
