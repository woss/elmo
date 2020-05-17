import { List } from "@material-ui/core";
import { getValuesByKey } from "@src/databases/ChromeStorage";
import React, { useEffect, useState } from "react";
import { browser, Tabs } from "webextension-polyfill-ts";
import PopupCollection from "./PopupCollection";
import { DB_NAME_COLLECTIONS } from "@src/databases/OrbitDB";

const PopupCollections = () => {
  // const [collections, setCollections] = useState([] as ICollection[]);
  const [collections, setCollections] = useState([] as { [s: string]: any });
  const [currentTab, setCurrentTab] = useState(null as Tabs.Tab);
  useEffect(() => {
    browser.tabs
      .query({
        active: true,
        currentWindow: true,
      })
      .then(async ([tab]) => {
        console.log(tab);
        if (tab.url === "chrome://newtab/") {
          return null;
        }

        setCurrentTab(tab);
        setCollections(await getValuesByKey(DB_NAME_COLLECTIONS));
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
