import { List } from "@material-ui/core";
import { getValuesByKey } from "@src/databases/ChromeStorage";
import React, { useEffect, useState } from "react";
import { browser, Tabs } from "webextension-polyfill-ts";
import PopupCollection from "./PopupCollection";

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
      .then(async tabs => {
        setCurrentTab(tabs[0]);
        // const c = await loadAllFromStore("collections");
        const c = await getValuesByKey("collections");
        // create array of objects
        // console.log(c.collections);
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
