import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import LinkCard from "./Link";
import { withStore, loadAllFromStore } from "@src/OrbitDB/OrbitDB";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
    },
}));

interface Props {
    links: string[];
}

function Links({ links }: Props) {
    const classes = useStyles();
    const store = withStore("collections");

    // store.events.on("replicate", address => {
    //     console.log("replication started", address);
    // });
    // store.events.on("replicated", () => {
    //     console.log("Got replication for ", store);
    //     loadAllFromStore("links").then(c => {
    //         console.log(c);
    //     });
    // });
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
