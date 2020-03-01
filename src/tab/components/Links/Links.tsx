import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Link from "./Link";

const useStyles = makeStyles(theme => ({
    root: {},
}));

interface Props {
    links: number[];
}

function Links({ links }: Props) {
    const classes = useStyles();
    return (
        <Grid className={classes.root}>
            <List>
                {links.map((link, key) => {
                    return <Link key={key} linkId={link} />;
                })}
            </List>
        </Grid>
    );
}

export default Links;
