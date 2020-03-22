import Checkbox from "@material-ui/core/Checkbox";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { ICollection } from "@src/interfaces";
import * as R from "ramda";
import React, { useEffect } from "react";
import { Tabs } from "webextension-polyfill-ts";
import {
  addToCollection,
  createLinkObjectFromTab,
  createPageInstance,
  removeFromCollection,
  saveLink,
  createLink,
} from "../Links/helpers";
import { calculateHash } from "@src/ipfsNode/helpers";

interface Props {
  collection: ICollection;
  currentTab: Tabs.Tab;
}

function PopupCollection({ collection, currentTab }: Props) {
  const [checked, setChecked] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);

  // const { ipfs } = useIpfsNode();
  const tabTopic = localStorage.getItem("tabTopic");

  async function handleToggle() {
    setDisabled(true);
    const hash = await calculateHash(currentTab.url);

    // Link exists, remove
    if (checked) {
      // now we are doing uncheck, remove
      await removeFromCollection(hash, collection);

      if (!R.isEmpty(tabTopic)) {
        // notify the main app
        console.log("Sending msg to ", tabTopic);
        // await ipfs.pubsub.publish(tabTopic, Buffer.from(JSON.stringify("yo")));
      }

      setChecked(false);
      setDisabled(false);
    } else {
      const link = await createLinkObjectFromTab(currentTab);
      const doc = await createPageInstance(link.url);

      // const ipfsPath = await addFileToIPFS(`/${currentTab.title}.html`, doc);

      try {
        const l = createLink({
          ...link,
          // ipfs: ipfsPath,
          ipfs: {
            cid: "dasdsa",
            path: "dasdasd",
          },
        });
        const hash = await saveLink(l);
        await addToCollection(hash, collection);

        if (!R.isEmpty(tabTopic)) {
          // notify the main app
          console.log("Sending msg to ", tabTopic);
          // await ipfs.pubsub.publish(
          //   tabTopic,
          //   Buffer.from(JSON.stringify("yo")),
          // );
        }
        setChecked(true);
        setDisabled(false);
      } catch (e) {
        console.error(e);
      }
    }
  }

  useEffect(() => {
    if (currentTab) {
      calculateHash(currentTab.url).then(async hash => {
        const inCollection = collection.links.includes(hash);
        if (inCollection) setChecked(true);
      });
    }
  }, [currentTab]);

  return (
    <ListItem dense button disabled={disabled} onClick={handleToggle}>
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={checked}
          tabIndex={-1}
          disableRipple
          color="primary"

          // inputProps={{ "aria-labelledby": labelId }}
        />
      </ListItemIcon>
      <ListItemText primary={collection.title} />
    </ListItem>
  );
}

export default PopupCollection;
