import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { DB_NAME_LINKS, loadAllFromStore } from "@src/databases/OrbitDB";
import { ILink } from "@src/interfaces";
import React, { useEffect, useState } from "react";
import LinkCard from "./Link";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
}));

function AllLinks() {
  const classes = useStyles();

  const [links, setLinks] = useState([] as ILink[]);

  useEffect(() => {
    loadAllFromStore(DB_NAME_LINKS).then((r) => {
      setLinks(r);
    });
  }, []);
  return (
    <Grid container className={classes.root}>
      {/* <List> */}
      {links.map((l) => {
        const { hash } = l;
        return (
          <Grid key={hash} item>
            <LinkCard linkHash={hash} />
          </Grid>
        );
      })}
      {/* </List> */}
    </Grid>
  );
}

export default AllLinks;
