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
  transformStoreToElmoDefinition,
} from "@src/OrbitDB/OrbitDB";
import Fade from "@material-ui/core/Fade";
import Database from "@src/tab/components/Database/Database";
import { useSnackbar } from "notistack";

import FirstTime from "./components/FirstTime/FirstTime";
import { createChatListener, formatMessage, bufferify } from "@src/chat/chat";
import ReplicateDatabase from "./components/CustomDialog/ReplicateDatabase";
import {
  IElmoIncomingMessage,
  IDatabaseDefinition,
  IElmoMessageActions,
  IElmoGenericMessage,
  IElmoMessageDeclineReplicateDB,
  IElmoMessageApproveReplicateDB,
} from "@src/interfaces";
import { IncomingMessage } from "@src/typings/ipfs";

export const history = createHashHistory();

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
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const continueToAppDefault = JSON.parse(
    localStorage.getItem("continueToApp"),
  );
  const preferRemoteDefault = JSON.parse(localStorage.getItem("preferRemote"));
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

  function handleContinueToApp({
    continueToApp,
    preferRemote: incomingPreferRemote,
  }) {
    setPreferRemote(incomingPreferRemote);
    setContinueToApp(continueToApp);
  }

  function onMessage(msg: IncomingMessage) {
    const message = formatMessage(msg) as any;

    if (message.message.action === IElmoMessageActions.REPLICATE_DB) {
      setIncomingMessage(message);
    } else if (
      message.message.action === IElmoMessageActions.APPROVE_REPLICATE_DB
    ) {
      console.debug(
        `Got ${message.message.action} ::  ${message.message.message}`,
      );
    } else {
      enqueueSnackbar(
        `Got ${message.message.action} ::  ${message.message.message}`,
      );
    }
  }

  async function handleAgree(decision) {
    const { ipfs } = useIpfsNode();

    const {
      from,
      message: { dbID },
    } = incomingMessage;

    if (!decision) {
      setIncomingMessage(null);
      const m: IElmoMessageDeclineReplicateDB = {
        action: IElmoMessageActions.DECLINE_REPLICATE_DB,
      };

      await ipfs.pubsub.publish(from, bufferify(JSON.stringify(m)));
      return null;
    }

    // Here is where we return the response back to the peer that wants to replicate the DB
    const { dbs: defaultStores } = useDBNode();

    // prepare message

    Promise.all(defaultStores.map(d => d.access.grant("write", dbID))).then(
      async () => {
        const dbs: IDatabaseDefinition[] = Object.values(defaultStores).map(s =>
          transformStoreToElmoDefinition(s),
        );
        console.log("SEND THE DBS", dbs);
        const message: IElmoMessageApproveReplicateDB = {
          action: IElmoMessageActions.APPROVE_REPLICATE_DB,
          dbs,
        };

        await ipfs.pubsub.publish(from, bufferify(JSON.stringify(message)));
        // here we send msg back with payload of all OrbitDB remote addr

        // set this to null after ALL is done, need the data from the msg
        setIncomingMessage(null);
      },
    );
  }

  useEffect(() => {
    if (ipfsReady && continueToApp) {
      if (preferRemote) {
        const dbs = JSON.parse(localStorage.getItem("remoteDatabases"));
        createDbs(dbs).then(d => {
          console.log("Remote dbs loaded");
          setTimeout(() => setReady(true), 200);
        });
      } else {
        createDefaultDbs().then(d => {
          console.log("Default dbs loaded");
          setTimeout(() => setReady(true), 200);
        });
      }
    }
  }, [continueToApp, ipfsReady]);

  useEffect(() => {
    // https://juliangaramendy.dev/use-promise-subscription/
    let isSubscribed = true;
    let unsubscribe;

    browser.runtime.sendMessage({ tabMounted: true });
    startIpfsNode()
      .then(async () => {
        try {
          // Create Local Subscription
          const { topic, unsubscribe: unsub } = await createChatListener(
            onMessage,
          );

          setSelfTopic(topic);

          // for unsubscribe
          unsubscribe = unsub;

          // add the topic ID to localStorage so the popup can pick it up
          localStorage.setItem("tabTopic", topic);

          await startOrbitDBInstance();
          setIpfsReady(true);
        } catch (e) {
          console.error(e);
        }
      })
      .catch(e => {
        console.error(e);
      });

    return () => {
      console.log("un-mounted");
      unsubscribe();
      isSubscribed = false;
    };
  }, []);

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

                <Route path="/ahh-the-choices">
                  <FirstTime
                    fromRoute
                    handleContinueToApp={handleContinueToApp}
                  />
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
