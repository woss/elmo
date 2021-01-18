import { Container, Typography } from '@material-ui/core'
import CssBaseline from '@material-ui/core/CssBaseline'
import Fade from '@material-ui/core/Fade'
import { makeStyles } from '@material-ui/core/styles'
import { getValuesByKey, syncDbDataWithStorage } from '@src/databases/ChromeStorage'
import { openAllStores, startOrbitDBInstance } from '@src/databases/OrbitDB'
import { listenOnPeers, startIpfsNode } from '@src/ipfsNode/ipfsFactory'
import Collections from '@src/tab/components/Collections/Collections'
import Database from '@src/tab/components/Database/Database'
import Header from '@src/tab/components/Header/Header'
import IpfsInfo from '@src/tab/components/IpfsComponent/IpfsInfo'
import View from '@src/tab/components/Links/View'
import FirstTime from '@tab/components/FirstTime/FirstTime'
import AllLinks from '@tab/components/Links/AllLinks'
import Messages from '@tab/components/Messages/Messages'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  root: {},
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}))

export const Tab: FunctionComponent = () => {
  const classes = useStyles()

  const [appInitialized, setAppInitialized] = useState(true)
  const [appReady, setAppReady] = useState(false)
  const [ipfsReady, setIpfsReady] = useState(false)

  async function handleAppInitialized(status: boolean) {
    setAppInitialized(status)
  }

  ///////////////////////////////////////////////
  // PAGE LOAD
  ///////////////////////////////////////////////
  useEffect(() => {
    console.time('TAB:: Load')

    async function init() {
      try {
        // 1. Start the IPFS node
        await startIpfsNode()

        // 2. Start the DB
        await startOrbitDBInstance()

        // 3. Set the states
        setIpfsReady(true)

        // Send msg to the background process so it will connect to the ipfs and be ready for saving and syncing
        // browser.runtime.sendMessage(
        //   createBrowserRuntimeMessage("connectToIpfsAndOrbitDB"),
        // );
        const appInit = await getValuesByKey('appInitialized')
        setAppInitialized(appInit === undefined ? false : appInit)

        console.timeEnd('TAB:: Load')
      } catch (e) {
        console.error(e)
      }
    }

    init()

    return () => {
      console.log('TAB:: un-mount')
      // unsubscribe();
    }
  }, [])

  /**
   * Watch for the conditions when the app should be ready
   */
  useEffect(() => {
    async function init() {
      if (appInitialized && ipfsReady) {
        await openAllStores()

        // Sync latest DATA to the Storage
        await syncDbDataWithStorage()

        console.log('All storage', await getValuesByKey())

        listenOnPeers()

        setAppReady(true)
      } else {
        return null
      }
    }

    init()
  }, [appInitialized, ipfsReady])

  if (!ipfsReady) {
    return (
      <div>
        <CssBaseline />
        <div className={classes.flex}>
          <Typography>Connecting to IPFS</Typography>
        </div>
      </div>
    )
  }

  if (!appInitialized) {
    return (
      <div>
        <CssBaseline />
        <div className={classes.flex}>
          <FirstTime handleAppInitialized={handleAppInitialized} />
        </div>
      </div>
    )
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
                  <FirstTime fromRoute handleAppInitialized={handleAppInitialized} />
                </Route>

                <Route path="/">
                  <Collections />
                </Route>
              </Switch>
            </Container>
          </div>
        </Fade>
        <Messages />
      </Fragment>
    )
  } else {
    return (
      <div>
        <CssBaseline />
        <div className={classes.flex}>
          <div>Warming up the app ....</div>{' '}
        </div>
      </div>
    )
  }
}

export default Tab
