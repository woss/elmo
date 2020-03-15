import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ICollection, ILink } from "@src/interfaces";
import Checkbox from "@material-ui/core/Checkbox";
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { createCID, addFileToIPFS } from "@src/ipfsNode/helpers";
import { Tabs } from "webextension-polyfill-ts";
import {
    createLinkObjectFromTab,
    createLink,
    addToCollection,
    removeFromCollection,
    createPageInstance,
    toDocument,
    getPageTitle,
} from "../Links/helpers";

import { withStore } from "@src/OrbitDB/OrbitDB";
const useStyles = makeStyles(theme => ({
    root: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));
interface Props {
    collection: ICollection;
    currentTab: Tabs.Tab;
}

function PopupCollection({ collection, currentTab }: Props) {
    const [checked, setChecked] = React.useState(false);

    async function handleToggle() {
        const hash = await createCID(currentTab.url);
        if (checked) {
            // now we are doing uncheck, remove
            await removeFromCollection(hash, collection);
            setChecked(false);
        } else {
            // now we are checking it, add

            const link = await createLinkObjectFromTab(currentTab);
            const doc = await createPageInstance(link.url);

            const ipfsPath = await addFileToIPFS(
                `/${currentTab.title}.html`,
                doc,
            );

            const hash = await createLink({ ...link, ipfs: ipfsPath });
            await addToCollection(hash, collection);
            setChecked(true);
        }
    }

    useEffect(() => {
        if (currentTab) {
            createCID(currentTab.url).then(async hash => {
                const inCollection = collection.links.includes(hash);
                if (inCollection) setChecked(true);
            });
        }
    }, [currentTab]);

    return (
        <ListItem dense button onClick={handleToggle}>
            <ListItemIcon>
                <Checkbox
                    edge="start"
                    checked={checked}
                    tabIndex={-1}
                    disableRipple
                    // inputProps={{ "aria-labelledby": labelId }}
                />
            </ListItemIcon>
            <ListItemText primary={collection.title} />
        </ListItem>
    );
}

export default PopupCollection;
