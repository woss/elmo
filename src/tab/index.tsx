import React from "react";
import ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import Tab from "./tab";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "@src/theme";
import { SnackbarProvider } from "notistack";

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(
        <ThemeProvider theme={theme}>
            <SnackbarProvider>
                <Tab />
            </SnackbarProvider>
        </ThemeProvider>,
        document.getElementById("tab"),
    );
});
