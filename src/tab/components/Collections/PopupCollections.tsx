import React, { useState, useEffect } from "react";
import { ICollection } from "@src/interfaces";
import PopupCollection from "./PopupCollection";
import { List } from "@material-ui/core";

import { browser, Tabs } from "webextension-polyfill-ts";

import { loadAllFromStore } from "@src/OrbitDB/OrbitDB";

const PopupCollections = () => {
    const [collections, setCollections] = useState([] as ICollection[]);
    const [currentTab, setCurrentTab] = useState(null as Tabs.Tab);
    useEffect(() => {
        browser.tabs
            .query({
                active: true,
                currentWindow: true,
            })
            .then(async tabs => {
                setCurrentTab(tabs[0]);
                const c = await loadAllFromStore("collections");
                setCollections(c);
            });
    }, []);
    return (
        <List>
            {collections.map(collection => {
                return (
                    <PopupCollection
                        key={collection._id}
                        collection={collection}
                        currentTab={currentTab}
                    />
                );
            })}
        </List>
    );
};

export default PopupCollections;
