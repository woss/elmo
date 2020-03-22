import { browser } from "webextension-polyfill-ts";

// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener(
  async (
    request: {
      tabMounted: boolean;
      popupMounted: boolean;
      fetchURL: string;
    },
    sender,
  ) => {
    console.log(`Message received from ${sender.url}`);

    // Log statement if request.popupMounted is true
    // NOTE: this request is sent in `popup/component.tsx`
    if (request.tabMounted) {
      console.log("backgroundPage notified that tab.tsx has mounted.");
    }
    if (request.popupMounted) {
      console.log("backgroundPage notified that Popup.tsx has mounted.");
    }
    if (request.fetchURL) {
      console.log("fetch the r", request.fetchURL);
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
