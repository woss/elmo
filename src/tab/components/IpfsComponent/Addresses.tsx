import React, { useEffect, useState } from "react";

import useIpfsEffect, { useIpfs } from "@src/ipfsNode/use-ipfs";
import { Id } from "@src/typings/ipfs";

import { Typography, ListItemText, makeStyles } from "@material-ui/core";

import CustomList from "@src/tab/components/Shared/CustomList";
import Connect from "./Connect";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    // maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: theme.spacing(2, 0, 2),
  },
  text: {
    overflowWrap: "anywhere",
  },
}));
function Addresses() {
  const classes = useStyles();
  const defaultValues: Id = {
    addresses: [],
    agentVersion: "",
    id: "",
    protocolVersion: "",
    publicKey: "",
  };
  const [identity, setIdentity] = useState(defaultValues);

  function fetchIdentity() {
    useIpfs("id").then(id => {
      setIdentity(id);
    });
  }
  useEffect(() => {
    fetchIdentity();
  }, []);

  // useEffect(() => {
  //     console.log("fetching identity");
  //     fetchIdentity();
  // }, [identity]);

  return (
    <div className={classes.root}>
      <Typography variant="h6">Public Key:</Typography>
      <span className={classes.text}>{identity.publicKey}</span>
      <Typography variant="h6">
        Swarm Addresses: {identity.addresses.length}
      </Typography>
      <CustomList data={identity.addresses} classes={classes} />
    </div>
  );
}

export default Addresses;
