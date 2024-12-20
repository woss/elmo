/* eslint-disable no-case-declarations */
import { Button, Grid, TextField, Typography } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import { makeStyles } from '@material-ui/core/styles'
import { createChatListener } from '@src/chat/chat'
import {
  getValuesByKey,
  initChromeStorage,
  setValue,
  syncDbDataWithStorage,
} from '@src/databases/ChromeStorage'
import { createDefaultStores, createStores, useDBNode } from '@src/databases/OrbitDB'
import {
  IDatabaseDefinition,
  IElmoGenericMessage,
  IElmoMessage,
  IElmoMessageActions,
} from '@src/interfaces'
import { useIpfsNode } from '@src/ipfsNode/ipfsFactory'
import useIpfsEffect, { useIpfs } from '@src/ipfsNode/use-ipfs'
import { IncomingMessage, PeerInfo } from '@src/typings/ipfs'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'

const useStyles = makeStyles((theme) => ({
  root: { width: '60vw' },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    // minHeight: 296,
  },
  input: {
    marginTop: theme.spacing(2),
  },
  title: {
    textAlign: 'center',
  },
}))

interface Props {
  handleAppInitialized: (boolean) => any
  fromRoute?: boolean
}

function FirstTime({ handleAppInitialized }: Props) {
  const classes = useStyles()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const [randomMessage, setRandomMessage] = useState('')
  const [remoteAddress, setRemoteAddress] = useState('')
  const [peers, setPeers] = useState([])
  const { ipfs } = useIpfsNode()
  const { instance } = useDBNode()

  const identity: PeerInfo = useIpfsEffect('id')

  function handleChange(e) {
    e.preventDefault()
    const val = e.target.value

    setRemoteAddress(val)
  }
  function handleChangeRandomMessage(e) {
    e.preventDefault()
    const val = e.target.value

    setRandomMessage(val)
  }

  async function handleClickCreateNew() {
    // Create Default Databases and default ChromeStorage
    try {
      await initChromeStorage()
      await createDefaultStores()
      await syncDbDataWithStorage()
      await setValue({ appInitialized: true })
      handleAppInitialized(true)
    } catch (error) {
      console.error(error)
    }
  }

  async function handleClickRemoteAddress() {
    console.log(`Message sent to ${remoteAddress}`)

    if (peers.includes(remoteAddress)) {
      console.log('address is on the list of connected peers')
    } else {
      console.log('address not on the list of connected peers')
    }
    const message: IElmoMessage = {
      action: IElmoMessageActions.REPLICATE_DB,
      all: true,
      dbID: instance.identity.id,
      pubKey: instance.identity.publicKey,
    }
    console.debug('Message:: ', message)
    await ipfs.pubsub.publish(remoteAddress, Buffer.from(JSON.stringify(message)))
  }

  async function handleClickSendMessage() {
    console.log(`Message sent to ${remoteAddress}`)
    console.log(peers)
    if (peers.includes(remoteAddress)) {
      console.log('address is on the list of connected peers')
    } else {
      console.log('address not on the list of connected peers')
    }
    const message: IElmoMessage = {
      action: IElmoMessageActions.PING,
      message: randomMessage,
    }
    console.debug('Message:: ', message)
    await ipfs.pubsub.publish(remoteAddress, Buffer.from(JSON.stringify(message)))
  }

  // RECEIVING THE MESSAGE FROM THE MASTER INSTANCE
  const onMessage = (msg: IncomingMessage) => {
    const message: IElmoGenericMessage = JSON.parse(msg.data.toString())

    console.debug(`Received message from ${msg.from} for the action ${message.action}`)
    console.debug('Message: ', message)
    // enqueueSnackbar(
    //   `Received message from ${msg.from} for the action ${message.action}`,
    // );

    // Create remote databases
    switch (message.action) {
      case IElmoMessageActions.REPLICATE_DB:
        // this is when the initiator wants to replicate DB
        break
      case IElmoMessageActions.APPROVE_REPLICATE_DB:
        // this is when the the request for replicateDB is approved
        const m: IDatabaseDefinition[] = message.dbs
        const k = enqueueSnackbar(`Hold on, we are setting up the replication ...`, {
          variant: 'info',
          persist: true,
        })
        const dbsWithOurIdentity = m.map((db) => {
          db.options.accessController.write.push(instance.identity.id)
          db.options.overwrite = true
          return db
        })
        console.debug('Replication the dbs', dbsWithOurIdentity)

        createStores(dbsWithOurIdentity, true).then(async () => {
          // await giveFullAccessToStores(instance.identity.id);
          // dbs.forEach(db => {
          //   console.log(db);
          //   db.events.on("replicated", async () => {
          //     await db.load();
          //     const res: any[] = await db.get("");
          //     console.log(res);
          //   });
          // });

          await initChromeStorage()
          await syncDbDataWithStorage()
          await setValue({ appInitialized: true })

          getValuesByKey().then(console.log)

          closeSnackbar(k)
          handleAppInitialized(true)
        })
        break
      case IElmoMessageActions.DECLINE_REPLICATE_DB:
        // this is when the initiator wants to replicate DB
        enqueueSnackbar(`Request denied`, {
          variant: 'error',
        })
        break
      case IElmoMessageActions.PING:
        enqueueSnackbar(message.message, {
          variant: 'info',
        })
        break
      default:
        console.error("We don't support that just yet", message.action)
        enqueueSnackbar(`We don't support that just yet ${message.action}`, {
          variant: 'error',
        })
        break
    }
  }
  useEffect(() => {
    // clear();
    getValuesByKey().then(console.log)
    // let isSubscribed = true;
    let unsubscribe
    // if (isSubscribed) {
    // Self listener, local messages or incoming
    createChatListener(onMessage).then(({ unsubscribe: unsub }) => {
      unsubscribe = unsub
    })
    // }
    const peersInterval = setInterval(() => {
      useIpfs('swarm.peers').then((peers) => {
        const p = peers.map((p) => {
          return p.addr.toString()
        })
        setPeers(p)
      })
    }, 1000)

    return () => {
      console.log('FIRST_TIME:: un-mount')
      unsubscribe()
      clearInterval(peersInterval)
      // isSubscribed = false;
    }
  }, [])

  return (
    <Grid
      container
      direction='column'
      className={[classes.root, classes.flex].join(' ')}
      spacing={2}
    >
      <Grid item className={classes.title}>
        <Typography variant='h3'>Welcome to ELMO :) </Typography>
        <Typography variant='subtitle2'>PEER ID: {identity && identity.id}</Typography>
      </Grid>
      <Grid item>
        <Grid container spacing={4}>
          <Grid item md={6} xs={12}>
            <Card className={classes.card}>
              <CardHeader title='Remote' />
              <CardContent>
                <Typography variant='body2' color='textSecondary' component='p'>
                  You have the ELMO instance running somewhere else and you want to connect to it.
                </Typography>

                <TextField
                  id='remoteAddress'
                  label='Remote address'
                  variant='outlined'
                  className={classes.input}
                  onChange={handleChange}
                  value={remoteAddress}
                  fullWidth
                />
              </CardContent>
              <CardActions>
                <Button color='primary' onClick={handleClickRemoteAddress}>
                  Connect to Remote ELMO
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item md={6} xs={12}>
            <Card className={classes.card}>
              <CardHeader title='New' />
              <CardContent>
                <Typography variant='body2' color='textSecondary' component='p'>
                  Starting a new ELMO instance will make it MASTER, all other will replicate from
                  this instance.The more instances you have higher availability of your data.
                </Typography>
              </CardContent>
              <CardActions>
                <Button color='primary' onClick={handleClickCreateNew}>
                  Create new ELMO
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item md={6} xs={12}>
            <Card className={classes.card}>
              <CardHeader title='Send a message' />
              <CardContent>
                <Typography variant='body2' color='textSecondary' component='p'>
                  Send a message to a peer
                </Typography>
                <TextField
                  id='message'
                  label='Message'
                  variant='outlined'
                  className={classes.input}
                  onChange={handleChangeRandomMessage}
                  value={randomMessage}
                  fullWidth
                />
                <TextField
                  id='remoteAddress'
                  label='Remote address'
                  variant='outlined'
                  className={classes.input}
                  onChange={handleChange}
                  value={remoteAddress}
                  fullWidth
                />
              </CardContent>
              <CardActions>
                <Button onClick={handleClickSendMessage}>Send!</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default FirstTime
