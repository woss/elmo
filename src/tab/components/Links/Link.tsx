import {
    Button,
    Card,
    CardActions,
    CardContent,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withStore, DB_NAME_LINKS } from "@src/databases/OrbitDB";
import { ILink } from "@src/interfaces";
import { isEmpty } from "ramda";
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

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
    const store = withStore(DB_NAME_LINKS);

    async function getLink(hash) {
        await store.load();
        const r = await store.get(hash);

        if (!isEmpty(r)) {
            setLink(r[0]);
        }
    }

    useEffect(() => {
        if (store) {
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
                    to={link.ipfs ? `/ipfs/cat/${link.hash}` : "#"}
                    // rel="noopener noreferrer"
                    // target="_blank"
                    size="small"
                    disabled={!link.ipfs.cid}
                    component={RouterLink}
                    variant="outlined"
                >
                    IPFS
                </Button>
            </CardActions>
        </Card>
    );
}
