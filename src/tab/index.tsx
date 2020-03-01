import * as React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import Tab from "./component";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "@src/theme";

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(
        <ThemeProvider theme={theme}>
            <Tab />
        </ThemeProvider>,
        document.getElementById("tab"),
    );
});
