import React, { useEffect, useState } from "react";
import { ILink } from "@src/interfaces";
import { makeStyles } from "@material-ui/core/styles";

import ListItem from "@material-ui/core/ListItem";
import CheckIcon from "@material-ui/icons/CheckCircle";
import OfflinePinIcon from "@material-ui/icons/OfflinePin";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    Button,
} from "@material-ui/core";

import { Link as RouterLink } from "react-router-dom";
import { withStore } from "@src/OrbitDB/OrbitDB";
import isEmpty from "lodash/isEmpty";

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

        if (!isEmpty(r)) {
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
                    color="primary"
                >
                    Online
                </Button>
                <Button
                    component={RouterLink}
                    to={link.ipfs ? `/view/${link.hash}` : "#"}
                    // rel="noopener noreferrer"
                    // target="_blank"
                    size="small"
                    disabled={!link.ipfs.cid}
                >
                    Offline
                </Button>
                <Button
                    href={
                        link.ipfs
                            ? `https://ipfs.io/ipfs/${link.ipfs.cid}`
                            : "#"
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                    size="small"
                    disabled={!link.ipfs.cid}
                >
                    IPFS
                </Button>
            </CardActions>
        </Card>
    );
}
