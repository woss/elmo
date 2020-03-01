import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import { LinkCard } from "./Link";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
    },
}));

interface Props {
    links: number[];
}

function Links({ links }: Props) {
    const classes = useStyles();
    return (
        <Grid container className={classes.root}>
            {/* <List> */}
            {links.map((link, key) => {
                return (
                    <Grid key={key} item>
                        <LinkCard linkId={link} />
                    </Grid>
                );
            })}
            {/* </List> */}
        </Grid>
    );
}

export default Links;
