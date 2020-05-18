import { Container, Typography } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import Fade from "@material-ui/core/Fade";
import { makeStyles } from "@material-ui/core/styles";
import { createChatListener } from "@src/chat/chat";
import {
  getValuesByKey,
  syncDbDataWithStorage,
} from "@src/databases/ChromeStorage";
import {
  createStoreDefinitions,
  openAllStores,
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
import { onMessage } from "@src/messages/messages";
import Collections from "@src/tab/components/Collections/Collections";
import Database from "@src/tab/components/Database/Database";
import Header from "@src/tab/components/Header/Header";
import IpfsInfo from "@src/tab/components/IpfsComponent/IpfsInfo";
import View from "@src/tab/components/Links/View";
import ReplicateDatabase from "@tab/components/CustomDialog/ReplicateDatabase";
import FirstTime from "@tab/components/FirstTime/FirstTime";
import AllLinks from "@tab/components/Links/AllLinks";
import React, { Fragment, FunctionComponent, useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";

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

  const [appInitialized, setAppInitialized] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [ipfsReady, setIpfsReady] = useState(false);

  const [incomingMessage, setIncomingMessage] = useState(
    null as IElmoIncomingMessage,
  );

  // Once fire when doc is loaded

  async function handleAppInitialized(data) {
    setAppInitialized(data);
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
        const dbs = createStoreDefinitions(defaultStores);
        console.log("SEND THE DBS", dbs);
        const message: IElmoMessageApproveReplicateDB = {
          action: IElmoMessageActions.APPROVE_REPLICATE_DB,
          dbs,
        };

        await ipfs.pubsub.publish(from, bufferify(JSON.stringify(message)));
        // here we send msg back with payload of all OrbitDB remote addr
        console.log(message);
        // set this to null after ALL is done, need the data from the msg
        setIncomingMessage(null);
      },
    );
  }

  ///////////////////////////////////////////////
  // PAGE LOAD
  ///////////////////////////////////////////////
  useEffect(() => {
    let unsubscribe: () => void;

    console.time("TAB:: Load");

    async function init() {
      try {
        // 1. Start the IPFS node
        await startIpfsNode();

        // 2. Create Local Subscription so we can communicate via ipfs
        const { unsubscribe: _unsubscribe } = await createChatListener(
          onMessage,
        );

        // 3. set the unsub function for on exit cleanup
        unsubscribe = _unsubscribe;

        // 4. Start the DB
        await startOrbitDBInstance();

        // 5. Set the states
        setIpfsReady(true);

        // Send msg to the background process so it will connect to the ipfs and be ready for saving and syncing
        // browser.runtime.sendMessage(
        //   createBrowserRuntimeMessage("connectToIpfsAndOrbitDB"),
        // );

        // app is initialized or not,
        // await openAllStores();
        setAppInitialized((await getValuesByKey("appInitialized")) || false);

        console.timeEnd("TAB:: Load");
      } catch (e) {
        console.error(e);
      }
    }

    init();

    return () => {
      console.log("TAB:: un-mount");
      unsubscribe();
    };
  }, []);

  /**
   * Watch for the conditions when the app should be ready
   */
  useEffect(() => {
    async function init() {
      if (appInitialized && ipfsReady) {
        await openAllStores();

        // Sync latest DATA to the Storage
        await syncDbDataWithStorage();

        console.log("All storage", await getValuesByKey());

        setAppReady(true);
      } else {
        return null;
      }
    }
    init();
  }, [appInitialized, ipfsReady]);

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

  if (!appInitialized) {
    return (
      <div>
        <CssBaseline />
        <div className={classes.flex}>
          <FirstTime handleAppInitialized={handleAppInitialized} />
        </div>
      </div>
    );
  }
  if (appReady) {
    return (
      <Fragment>
        <Fade in={appReady}>
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
                    handleAppInitialized={handleAppInitialized}
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
