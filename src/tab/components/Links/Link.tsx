import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withStore } from "@src/databases/OrbitDB";
import { ILink } from "@src/interfaces";
import * as R from "ramda";
import React, { useEffect, useState } from "react";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    maxWidth: 275,
    margin: theme.spacing(2),
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}));

interface Props {
  linkHash: string;
}

export default function LinkCard({ linkHash }: Props) {
  const classes = useStyles();

  const defaultState: ILink = {
    _id: "",
    title: "",
    url: "",
    hash: "",
    createdAt: 0,
    ipfs: {
      path: "",
      cid: "",
    },
  };
  const [link, setLink] = useState(defaultState);
  const linkStore = withStore("links");

  async function getLink(hash) {
    const r = await linkStore.get(hash);

    if (!R.isEmpty(r)) {
      setLink(r[0]);
    }
  }

  useEffect(() => {
    if (linkStore) {
      getLink(linkHash);
    }
  });

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2" noWrap>
          {link.title}
        </Typography>
        {/* <Typography className={classes.pos} color="textSecondary">
                    maybe tags??
                </Typography>
                <Typography variant="body2" component="p">
                    body
                </Typography> */}
      </CardContent>
      <CardActions>
        <Button
          href={link.url}
          rel="noopener noreferrer"
          target="_blank"
          size="small"
          // color="primary"
          variant="outlined"
        >
          Online
        </Button>
        <Button
          href={link.ipfs ? `https://ipfs.io/ipfs/${link.ipfs.cid}` : "#"}
          rel="noopener noreferrer"
          target="_blank"
          size="small"
          disabled={!link.ipfs.cid}
          variant="outlined"
        >
          IPFS
        </Button>
      </CardActions>
    </Card>
  );
}
