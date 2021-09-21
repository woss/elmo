import React, { useState } from 'react'
import { useDBNode } from '@src/databases/OrbitDB'
import { Typography, Grid, makeStyles, Paper, Button } from '@material-ui/core'
import Identity from './Identity'
import { clear } from '@src/databases/ChromeStorage'

const useStyles = makeStyles((theme) => ({
  root: {},
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
  title: {
    margin: theme.spacing(1),
  },
}))

function Database() {
  const { dbs } = useDBNode()
  const classes = useStyles()

  async function handleClear() {
    await clear()
    console.log('Clear DONE')
  }
  // async function handleClearSiteData() {
  //   localStorage.clear();

  //   const dbs = await window.indexedDB.databases();
  //   Promise.all(
  //     dbs.map(async db => {
  //       console.log(db);
  //       window.indexedDB.deleteDatabase(db.name);
  //     }),
  //   );
  //   console.log("Clear DONE");
  // }
  return (
    <Grid container spacing={4}>
      <Grid item>
        <Typography variant='h4'>Database Settings and Info</Typography>
        <Paper className={classes.paper}>
          <ul>
            {dbs.map((store) => {
              return (
                <li key={store.address.toString()}>
                  DB name: {store.dbname}
                  <br />
                  DB address: {store.address.toString()}
                </li>
              )
            })}
          </ul>
        </Paper>
      </Grid>
      <Grid item>
        <Identity />
      </Grid>
      <Grid item>
        <Button onClick={handleClear} variant='outlined' color='secondary'>
          Clear Chrome Storage
        </Button>
        {/* <Button
          onClick={handleClearSiteData}
          variant="outlined"
          color="secondary"
        >
          Clear Site Data
        </Button> */}
      </Grid>
    </Grid>
  )
}

export default Database
