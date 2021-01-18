import { browser } from "webextension-polyfill-ts";
import {
  addCollection,
  openAllStores,
  startOrbitDBInstance,
} from "./databases/OrbitDB";
import { startIpfsNode } from "./ipfsNode/ipfsFactory";
import {
  addToCollection,
  downloadAndSaveLink,
  removeFromCollection,
} from "./tab/components/Links/helpers";

function createBrowserRuntimeMessage(params: any, c: any) {}
// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener(
  async (
    r: {
      action: string;
      payload: any;
    },
    sender,
  ) => {
    console.log(
      `Message received from ${sender.url} for action ${r.action}`,
      r.payload,
    );
    try {
      let collection;
      switch (r.action) {
        case "connectToIpfsAndOrbitDB":
          await startIpfsNode();
          await startOrbitDBInstance();
          await openAllStores();
          break;
        case "addCollection":
          const _c = await addCollection(r.payload.collection);
          console.log(_c);

          browser.runtime.sendMessage(
            createBrowserRuntimeMessage("newCollection", {
              collection: _c,
            }),
          );
          break;
        case "saveLink":
          const link = await downloadAndSaveLink(r.payload.url);
          collection = await addToCollection(link.hash, r.payload.collection);

          browser.runtime.sendMessage(
            createBrowserRuntimeMessage("linkSaved", {
              link,
              collection,
            }),
          );
          browser.runtime.sendMessage(
            createBrowserRuntimeMessage("newLink", { collection }),
          );
          break;
        case "removeLink":
          collection = await removeFromCollection(
            r.payload.linkHash,
            r.payload.collection,
          );

          browser.runtime.sendMessage(
            createBrowserRuntimeMessage("linkRemovedFromCollection", {
              link,
              collection,
            }),
          );
          browser.runtime.sendMessage(
            createBrowserRuntimeMessage("newLink", { collection }),
          );
          break;

        default:
          console.error(`BACKGROUND::: Unsupported action ${r.action}`);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  },
);

browser.storage.onChanged.addListener((changes, namespace) => {
  for (const key in changes) {
    const storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue,
    );
  }
});
