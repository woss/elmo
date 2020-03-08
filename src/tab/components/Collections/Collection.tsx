import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { ICollection } from "@src/interfaces";
import Links from "../Links/Links";

import TEST_DB from "@src/TEST_DB";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    content: {
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        padding: theme.spacing(3),
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary["A100"],
    },
}));
interface Props {
    collection: ICollection;
}
function Collection({ collection }: Props) {
    const classes = useStyles();

    const workspaces = TEST_DB.workspaces;
    return (
        <Grid className={classes.root}>
            <div className={classes.title}>
                <Typography variant="h4" component="h4">
                    {collection.title}
                </Typography>
                Workspaces:
                {collection.workspaceIndexes.map((idx, k) => {
                    return (
                        <span key={k}>
                            {workspaces[idx]
                                ? ` ${workspaces[idx].name}, `
                                : ""}
                        </span>
                    );
                })}
            </div>

            <Links links={collection.links} />
        </Grid>
    );
}

export default Collection;
