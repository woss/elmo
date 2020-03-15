import React, { FunctionComponent, useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { browser } from "webextension-polyfill-ts";
import Header from "@src/tab/components/Header/Header";
import Collections from "@src/tab/components/Collections/Collections";
import { Router, Switch, Route } from "react-router-dom";
import IpfsInfo from "@src/tab/components/IpfsComponent/IpfsInfo";

import { Container, Typography } from "@material-ui/core";
import { createHashHistory } from "history";
import View from "@src/tab/components/Links/View";
import { startIpfsNode, useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import {
    startOrbitDBInstance,
    useDBNode,
    createDefaultDbs,
    createDbs,
    setupReplicationListeners,
} from "@src/OrbitDB/OrbitDB";
import Fade from "@material-ui/core/Fade";
import Database from "@src/tab/components/Database/Database";

import FirstTime from "./components/FirstTime/FirstTime";
import { createChatListener, formatMessage, bufferify } from "@src/chat/chat";
import ReplicateDatabase from "./components/CustomDialog/ReplicateDatabase";
import {
    IElmoIncomingMessage,
    IDatabaseDefinition,
    IOrbitDBAccessControllerOption,
    AccessControllerType,
} from "@src/interfaces";
import { IncomingMessage } from "@src/typings/ipfs-types";

const history = createHashHistory();

const useStyles = makeStyles(theme => ({
    root: {},
    flex: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

export const Tab: FunctionComponent = () => {
    const classes = useStyles();

    const continueToAppDefault = JSON.parse(
        localStorage.getItem("continueToApp"),
    );
    const preferRemoteDefault = JSON.parse(
        localStorage.getItem("preferRemote"),
    );
    // if undefined or null or false then show first otherwise continueToApp
    const [preferRemote, setPreferRemote] = useState(preferRemoteDefault);
    const [continueToApp, setContinueToApp] = useState(continueToAppDefault);
    const [ready, setReady] = useState(false);
    const [ipfsReady, setIpfsReady] = useState(false);
    const [selfTopic, setSelfTopic] = useState("");

    const [incomingMessage, setIncomingMessage] = useState(
        null as IElmoIncomingMessage,
    );

    // Once fire when doc is loaded
    React.useEffect(() => {
        browser.runtime.sendMessage({ tabMounted: true });
        startIpfsNode().then(() =>
            startOrbitDBInstance().then(async () => setIpfsReady(true)),
        );

        // here we do testing
        // createInstance();
    }, []);

    function handleContinueToApp({
        continueToApp,
        preferRemote: incomingPreferRemote,
    }) {
        setPreferRemote(incomingPreferRemote);
        setContinueToApp(continueToApp);
    }

    function onMessage(msg: IncomingMessage) {
        setIncomingMessage(formatMessage(msg));
    }

    async function handleAgree(decision) {
        if (!decision) {
            setIncomingMessage(null);
            return null;
        }

        // Here is where we return the response back to the peer that wants to replicate the DB
        const {
            dbs: defaultStores,
            instance: { identity },
        } = useDBNode();
        const { ipfs } = useIpfsNode();

        const {
            from,
            message: { dbID },
        } = incomingMessage;
        // prepare message

        Promise.all(defaultStores.map(d => d.access.grant("write", dbID))).then(
            async d => {
                const dbs: IDatabaseDefinition[] = Object.values(
                    defaultStores,
                ).map(s => {
                    return {
                        address: s.address.toString(),
                        storeType: s.options.type,
                        options: {
                            // accessController,
                            indexBy: s.options.indexBy,
                        },
                    };
                });

                const message = {
                    action: "approveReplicateDB",
                    dbs,
                };

                await ipfs.pubsub.publish(
                    from,
                    bufferify(JSON.stringify(message)),
                );
                // here we send msg back with payload of all OrbitDB remote addr

                // set this to null after ALL is done, need the data from the msg
                setIncomingMessage(null);
            },
        );
    }

    React.useEffect(() => {
        if (ipfsReady && continueToApp) {
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

            // Create local channel ans listens to the messages.
            // Main use is to send local messages withing same instance
            // or listen for the incoming messages, mainly about replicating the DB
            createChatListener(onMessage).then(({ topic }) => {
                setSelfTopic(topic);
            });
        }
    }, [continueToApp, ipfsReady]);

    if (!ipfsReady) {
        return (
            <div>
                <CssBaseline />
                <div className={classes.flex}>
                    <Typography>Connecting to IPFS</Typography>
                </div>
            </div>
        );
    }

    if (!continueToApp) {
        return (
            <div>
                <CssBaseline />
                <div className={classes.flex}>
                    <FirstTime handleContinueToApp={handleContinueToApp} />
                </div>
            </div>
        );
    }

    if (ready) {
        return (
            <Router history={history}>
                <Fade in={ready}>
                    <div className={classes.root}>
                        <CssBaseline />
                        <Header />
                        <Container className={classes.content}>
                            <Switch>
                                <Route path="/view/:cid" children={<View />} />

                                <Route path="/ipfs">
                                    <IpfsInfo />
                                </Route>
                                <Route path="/db">
                                    <Database />
                                </Route>

                                <Route path="/">
                                    <Collections />
                                </Route>
                            </Switch>
                        </Container>
                    </div>
                </Fade>
                {incomingMessage && (
                    <ReplicateDatabase
                        open={!!incomingMessage}
                        {...incomingMessage}
                        handleAgree={handleAgree}
                    />
                )}
            </Router>
        );
    } else {
        return (
            <div>
                <CssBaseline />
                <div className={classes.flex}>
                    <div>Warming up the app ....</div>{" "}
                </div>
            </div>
        );
    }
};

export default Tab;
