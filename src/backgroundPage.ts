import { browser } from "webextension-polyfill-ts";

// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener(
    (request: {
        tabMounted: boolean;
        popupMounted: boolean;
        fetchURL: string;
    }) => {
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
