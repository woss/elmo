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
    IElmoIncomingMessage,
} from "@src/interfaces";
import { createDbs, useDBNode } from "@src/OrbitDB/OrbitDB";
const useStyles = makeStyles(theme => ({
    root: { width: "60vw" },

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
}

function FirstTime({ handleContinueToApp }: Props) {
    const classes = useStyles();
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
        console.debug(`Received message from ${msg.from}`);

        const message: IElmoIncomingMessageReplicateDB = JSON.parse(
            msg.data.toString(),
        );
        // Create remote databases
        switch (message.action) {
            case "approveReplicateDB":
                const m: IDatabaseDefinition[] = message.dbs;
                // const withDbID = m.map(i => {
                //     let x: IDatabaseDefinition = i;
                //     x.options.accessController.write.push(instance.identity.id);
                //     return x;
                // });

                createDbs(m).then(d => {
                    localStorage.setItem("remoteDatabases", JSON.stringify(m));
                    handleClickCreateNew(true);
                });
                break;

            default:
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
        <Grid container direction="column" className={classes.root} spacing={2}>
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
