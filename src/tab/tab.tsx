import { Container, Typography } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import Fade from "@material-ui/core/Fade";
import { makeStyles } from "@material-ui/core/styles";
import { createChatListener } from "@src/chat/chat";
import {
  getValuesByKey,
  setValue,
  syncDbDataWithStorage,
} from "@src/databases/ChromeStorage";
import {
  createDatabaseDefinitions,
  openAllDatabases,
  startOrbitDBInstance,
  useDBNode,
} from "@src/databases/OrbitDB";
import { bufferify } from "@src/helpers";
import {
  IElmoIncomingMessage,
  IElmoMessageActions,
  IElmoMessageApproveReplicateDB,
  IElmoMessageDeclineReplicateDB,
} from "@src/interfaces";
import { startIpfsNode, useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import { createBrowserRuntimeMessage, onMessage } from "@src/messages/messages";
import Collections from "@src/tab/components/Collections/Collections";
import Database from "@src/tab/components/Database/Database";
import Header from "@src/tab/components/Header/Header";
import IpfsInfo from "@src/tab/components/IpfsComponent/IpfsInfo";
import View from "@src/tab/components/Links/View";
import React, { Fragment, FunctionComponent, useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import { browser } from "webextension-polyfill-ts";
import ReplicateDatabase from "./components/CustomDialog/ReplicateDatabase";
import FirstTime from "./components/FirstTime/FirstTime";
import AllLinks from "./components/Links/AllLinks";

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

  const [continueToApp, setContinueToApp] = useState(false);
  const [ready, setReady] = useState(false);
  const [ipfsReady, setIpfsReady] = useState(false);

  const [incomingMessage, setIncomingMessage] = useState(
    null as IElmoIncomingMessage,
  );

  // Once fire when doc is loaded

  async function handleContinueToApp({ continueToApp }) {
    setContinueToApp(continueToApp);
    await setValue({ continueToApp: true });
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
        const dbs = createDatabaseDefinitions(defaultStores);
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

  ///////////////////////////////////////////////
  // SETTING UP THE APPLICATION
  ///////////////////////////////////////////////
  useEffect(() => {
    if (ipfsReady && continueToApp) {
      // Open all the DBs
      openAllDatabases().then(async () => {
        // Sync latest DATA to the Storage
        await syncDbDataWithStorage();

        console.timeEnd("TAB:: Load");

        browser.runtime.sendMessage(
          createBrowserRuntimeMessage("connectToIpfsAndOrbitDB"),
        );
        console.log("All storage", await getValuesByKey());

        setTimeout(() => setReady(true), 200);
      });
    }
  }, [continueToApp, ipfsReady]);

  ///////////////////////////////////////////////
  // PAGE LOAD
  ///////////////////////////////////////////////
  useEffect(() => {
    // https://juliangaramendy.dev/use-promise-subscription/
    let unsubscribe;
    console.time("TAB:: Load");

    startIpfsNode()
      .then(async () => {
        try {
          // Create Local Subscription
          const { unsubscribe: _unsubscribe } = await createChatListener(
            onMessage,
          );

          // for unsubscribe
          unsubscribe = _unsubscribe;

          await startOrbitDBInstance();

          setIpfsReady(true);
        } catch (e) {
          console.error(e);
        }
      })
      .catch(e => {
        console.error(e);
      });

    getValuesByKey("continueToApp").then(continueToApp => {
      setContinueToApp(continueToApp);
    });
    return () => {
      unsubscribe();
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
      <Fragment>
        <Fade in={ready}>
          <div className={classes.root}>
            <CssBaseline />
            <Header />
            <Container className={classes.content}>
              <Switch>
                <Route path="/links">
                  <AllLinks />
                </Route>
                <Route path="/view/:cid">
                  <View />
                </Route>

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
      </Fragment>
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
