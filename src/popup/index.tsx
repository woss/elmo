import React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import { Popup } from "./popup";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "@src/theme";
browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(
        <ThemeProvider theme={theme}>
            <Popup />
        </ThemeProvider>,
        document.getElementById("popup"),
    );
});
