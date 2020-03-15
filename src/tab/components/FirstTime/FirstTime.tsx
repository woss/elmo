import React, { useState, SyntheticEvent, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Button, TextField, Grid } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import { createChatListener } from "@src/chat/chat";
import { useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import useIpfsEffect, { useIpfs } from "@src/ipfsNode/use-ipfs";
import { PeerInfo, IncomingMessage } from "@src/typings/ipfs-types";
import {
    IElmoIncomingMessageReplicateDB,
    IDatabaseDefinition,
} from "@src/interfaces";
import { createDbs, useDBNode } from "@src/OrbitDB/OrbitDB";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(theme => ({
    root: { width: "60vw" },
    flex: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        // minHeight: 296,
    },
    input: {
        marginTop: theme.spacing(2),
    },
    title: {
        textAlign: "center",
    },
}));

interface Props {
    handleContinueToApp: (e: {
        continueToApp?: boolean;
        continueAppWitRemote?: boolean;
    }) => any;
    fromRoute: boolean;
}

function FirstTime({ handleContinueToApp, fromRoute }: Props) {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const history = useHistory();

    const [remoteAddress, setRemoteAddress] = useState("");
    const [selfTopic, setSelfTopic] = useState("");
    const { ipfs } = useIpfsNode();
    const { instance } = useDBNode();

    const identity: PeerInfo = useIpfsEffect("id");

    function handleChange(e) {
        e.preventDefault();
        const val = e.target.value;

        setRemoteAddress(val);
    }

    async function handleClickRemoteAddress() {
        enqueueSnackbar("Message sent to remote peer");
        const message: IElmoIncomingMessageReplicateDB = {
            action: "replicateDB",
            all: true,
            dbID: instance.identity.id,
        };
        await ipfs.pubsub.publish(
            remoteAddress,
            Buffer.from(JSON.stringify(message)),
        );
    }

    // RECEIVING THE MESSAGE FROM THE MASTER INSTANCE
    const onMessage = (msg: IncomingMessage) => {
        const message: IElmoIncomingMessageReplicateDB = JSON.parse(
            msg.data.toString(),
        );

        console.debug(
            `Received message from ${msg.from} for the action ${message.action}`,
        );
        console.debug("Message: ", message);
        enqueueSnackbar(
            `Received message from ${msg.from} for the action ${message.action}`,
        );

        // Create remote databases
        switch (message.action) {
            case "approveReplicateDB":
                // this is when the the request for replicateDB is approved
                const m: IDatabaseDefinition[] = message.dbs;

                createDbs(m).then(d => {
                    localStorage.setItem("remoteDatabases", JSON.stringify(m));
                    console.log("fromRoute", fromRoute);
                    if (fromRoute) {
                        history.push("/");
                    } else {
                        handleClickCreateNew(true);
                    }
                });
                break;
            case "replicateDB":
                // this is when the initiator wants to replicate DB
                break;
            default:
                console.error("We don't support that just yet", message.action);
                enqueueSnackbar(
                    `We don't support that just yet ${message.action}`,
                    { variant: "error" },
                );
                break;
        }
    };
    useEffect(() => {
        // Self listener, local messages or incoming
        createChatListener(onMessage).then(({ topic: d, unsubscribe }) => {
            setSelfTopic(d);
            return unsubscribe;
        });
    }, []);

    function handleClickCreateNew(remote: boolean = false) {
        localStorage.setItem("preferRemote", remote.toString());
        localStorage.setItem("continueToApp", "true");
        handleContinueToApp({
            continueToApp: true,
            preferRemote: remote,
        });
    }

    return (
        <Grid
            container
            direction="column"
            className={[classes.root, classes.flex].join(" ")}
            spacing={2}
        >
            <Grid item className={classes.title}>
                <Typography variant="h3">Welcome to ELMO 👋</Typography>
                <Typography variant="subtitle2">
                    PEER ID: {identity && identity.id}
                </Typography>
            </Grid>
            <Grid item>
                <Grid container spacing={2}>
                    <Grid item md={6} xs>
                        <Card className={classes.card}>
                            <CardHeader title="Remote" />
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    component="p"
                                >
                                    You have the ELMO instance running somewhere
                                    else and you want to connect to it.
                                </Typography>

                                <TextField
                                    id="remoteAddress"
                                    label="Remote address"
                                    variant="outlined"
                                    className={classes.input}
                                    onChange={handleChange}
                                    value={remoteAddress}
                                    fullWidth
                                />
                            </CardContent>
                            <CardActions>
                                <Button
                                    color="primary"
                                    onClick={handleClickRemoteAddress}
                                >
                                    Connect to Remote ELMO
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item md={6} xs>
                        <Card className={classes.card}>
                            <CardHeader title="New" />
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    component="p"
                                >
                                    Starting a new ELMO instance will make it
                                    MASTER, all other will replicate from this
                                    instance.The more instances you have higher
                                    availability of your data.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    color="primary"
                                    onClick={() => handleClickCreateNew(false)}
                                >
                                    Create new ELMO
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default FirstTime;
