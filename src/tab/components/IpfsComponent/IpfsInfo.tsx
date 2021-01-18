import {
  Button,
  Grid,
  GridSpacing,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import OfflineBoltIcon from "@material-ui/icons/OfflineBolt";
import { useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import useIpfsEffect from "@src/ipfsNode/use-ipfs";
import { red } from "bn.js";
import React, { useEffect, useState } from "react";
import Addresses from "./Addresses";
import Config from "./Config";
import Connect from "./Connect";
import { MyNodes } from "./MyNodes";
import SwarmPeers from "./SwarmPeers";

const useStyles = makeStyles((theme) => ({
  root: {},
  left: {
    // backgroundColor: theme.palette.primary[300],
  },
  center: {
    // backgroundColor: theme.palette.primary[400],
  },
  right: {},
  titleContainer: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
  },
  title: {
    margin: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
  nodeInfo: {
    marginRight: theme.spacing(1),
  },
}));

export const IpfsInfo = () => {
  const classes = useStyles();
  const { error, isIpfsReady } = useIpfsNode();
  const [spacing, setSpacing] = useState(4 as GridSpacing);

  const node = useIpfsEffect("id");
  const isOnline = useIpfsEffect("isOnline");

  const version = useIpfsEffect("version");

  if (!isIpfsReady) {
    return <span>Connecting to IPFS...</span>;
  }
  async function testStuff() {
    // let r;
    // r = await ipfs.files.ls("/");
    // r = await ipfs.cat(
    //     "bafk2bzacedghgpq3o3hyucubfcv6mcttsnwzevnnelo6p5tuk4imh34ewl3na",
    // );
    // console.log(r);
  }
  useEffect(() => {
    testStuff();
  }, []);
  return (
    <Grid container spacing={spacing} className={classes.root}>
      <Grid item md xs>
        <Grid
          container
          direction="column"
          // spacing={spacing}
          // className={classes.root}
        >
          <Grid item>
            <Paper className={classes.titleContainer}>
              <Typography variant="h6" className={classes.title}>
                Peer ID: {node && node.id}
              </Typography>
              <div className={classes.nodeInfo}>
                <IconButton disabled>
                  <OfflineBoltIcon
                    style={{
                      color: isOnline ? green[500] : red[500],
                    }}
                  />
                </IconButton>
                {version && (
                  <Button component="span" disabled>
                    {version.version}
                  </Button>
                )}
              </div>
            </Paper>
          </Grid>
          <Grid item>
            <Paper className={classes.paper}>
              <Addresses />
            </Paper>
          </Grid>
          <Grid item>
            <Paper className={classes.paper}>
              <SwarmPeers />
            </Paper>
          </Grid>
          <Grid item>
            <Paper className={classes.paper}>
              <Config />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid item md={4}>
        <Paper className={classes.paper}>
          <MyNodes />
        </Paper>
        <Paper className={classes.paper}>
          <Connect />
        </Paper>
      </Grid>
    </Grid>
  );
};
export default IpfsInfo;
