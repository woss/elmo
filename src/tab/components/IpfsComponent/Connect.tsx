import React, { useState, Fragment } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Paper, Button } from '@material-ui/core'
import { useIpfsNode, connectToExternal } from '@src/ipfsNode/ipfsFactory'
const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      // width: 200,
    },
  },
  title: {
    margin: theme.spacing(2, 0, 2),
  },
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
}))
function Connect() {
  const classes = useStyles()
  const { ipfs } = useIpfsNode()
  const [address, setAddress] = useState('')
  const [api, setApi] = useState('http://127.0.0.1:5003')
  const [gateway, setGateway] = useState('http://127.0.0.1:9091')
  async function handleConnect() {
    if (address) {
      const r = await ipfs.swarm.connect(address)
      console.log(r)
    }
    if (api && gateway) {
      const r = await connectToExternal({ api, gateway })
      console.log(r)
    }
  }
  function handleChange(e) {
    const id = e.target.id
    const val = e.target.value

    switch (id) {
      case 'ipfs-peer':
        setAddress(val)

        break
      case 'ipfs-api':
        setApi(val)
        break
      case 'ipfs-gateway':
        setGateway(val)
        break

      default:
        console.error('not covered')
        break
    }
  }
  return (
    <Fragment>
      <Typography variant='h6'>Connections:</Typography>
      <form className={classes.root} name='connect-to-another-peer' onSubmit={handleConnect}>
        <TextField
          fullWidth
          id='ipfs-peer'
          label='Peer'
          variant='outlined'
          value={address}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          id='ipfs-api'
          label='API'
          variant='outlined'
          value={api}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          id='ipfs-gateway'
          label='Gateway'
          variant='outlined'
          value={gateway}
          onChange={handleChange}
        />

        <Button onClick={handleConnect} variant='contained' color='primary'>
          Connect
        </Button>
      </form>
    </Fragment>
  )
}

export default Connect
