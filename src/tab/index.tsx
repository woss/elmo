import React from "react";
import ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import Tab from "./tab";
import { ThemeProvider, Button } from "@material-ui/core";
import { theme } from "@src/theme";
import { SnackbarProvider } from "notistack";

// const notistackRef = React.createRef() as any;
// const onClickDismiss = key => () => {
//   notistackRef.current.closeSnackbar(key);
// };

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={7}
        preventDuplicate
        // ref={notistackRef}
        // action={key => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
      >
        <Tab />
      </SnackbarProvider>
    </ThemeProvider>,
    document.getElementById("tab"),
  );
});
