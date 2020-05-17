import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import LinkCard from "./Link";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
}));

interface Props {
  links: string[];
}

function Links({ links }: Props) {
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      {/* <List> */}
      {links.map((hash, key) => {
        return (
          <Grid key={key} item>
            <LinkCard linkHash={hash} />
          </Grid>
        );
      })}
      {/* </List> */}
    </Grid>
  );
}

export default Links;
