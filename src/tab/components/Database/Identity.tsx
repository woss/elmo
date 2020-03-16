import React from "react";
import { useDBNode } from "@src/OrbitDB/OrbitDB";
import { Typography, Paper, useTheme, makeStyles } from "@material-ui/core";

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

function Identity() {
  const { instance } = useDBNode();
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography className={classes.title} variant="h4">
        Database Identity
      </Typography>
      <Paper className={classes.paper}>
        <Typography>ID: {instance.identity.id}</Typography>
        <Typography>
          <span>Use this key to give the access to another DB</span>
          Public Key: {instance.identity.publicKey}
        </Typography>
      </Paper>
    </div>
  );
}

export default Identity;
