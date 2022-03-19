// @flow strict

import React from 'react'
import useIpfsEffect from '@src/ipfsNode/use-ipfs'
import { Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'auto',
  },
  pre: {
    display: 'block',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    margin: '1em 0',
    wordBreak: 'break-word',
  },
}))

function Config() {
  const config = useIpfsEffect('config.get')
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Typography variant='h6'>Config</Typography>
      <pre className={classes.pre}>{JSON.stringify(config, null, 2)}</pre>
    </div>
  )
}

export default Config
