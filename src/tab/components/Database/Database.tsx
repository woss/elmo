import React, { useState } from "react";
import { useDBNode } from "@src/OrbitDB/OrbitDB";
import { Typography, Grid, makeStyles, Paper } from "@material-ui/core";
import Identity from "./Identity";

const useStyles = makeStyles(theme => ({
  root: {},
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
  title: {
    margin: theme.spacing(1),
  },
}));

function Database() {
  const { dbs } = useDBNode();
  const classes = useStyles();
  return (
    <Grid container spacing={4}>
      <Grid item>
        <Typography variant="h4">Database Settings and Info</Typography>
        <Paper className={classes.paper}>
          <ul>
            {dbs.map(store => {
              return (
                <li key={store.address.toString()}>
                  DB name: {store.dbname}
                  <br />
                  DB address: {store.address.toString()}
                </li>
              );
            })}
          </ul>
        </Paper>
      </Grid>
      <Grid item>
        <Identity />
      </Grid>
    </Grid>
  );
}

export default Database;
