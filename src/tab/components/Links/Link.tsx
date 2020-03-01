import * as React from "react";
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

import { ListItemText, IconButton } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    root: {
        minWidth: 275,
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

import TEST_DB from "@src/TEST_DB";

const dbLinks = TEST_DB.links;

interface Props {
    linkId: number;
}
function Link({ linkId }: Props) {
    const link: ILink = dbLinks[linkId];

    if (!link) {
        return null;
    }
    return (
        <ListItem>
            <ListItemIcon>
                <CheckIcon />
            </ListItemIcon>
            <ListItemText
                primary={link.title.toUpperCase()}
                secondary={link.url}
            />
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete">
                    <OfflinePinIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
}

export function LinkCard({ linkId }: Props) {
    const classes = useStyles();
    const bull = <span className={classes.bullet}>•</span>;

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                >
                    Word of the Day
                </Typography>
                <Typography variant="h5" component="h2">
                    be{bull}nev{bull}o{bull}lent
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                    adjective
                </Typography>
                <Typography variant="body2" component="p">
                    well meaning and kindly.
                    <br />
                    {'"a benevolent smile"'}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Learn More</Button>
            </CardActions>
        </Card>
    );
}

export default Link;
