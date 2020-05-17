import React from "react";
import ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import Tab from "./tab";
import { ThemeProvider, Button } from "@material-ui/core";
import { theme } from "@src/theme";
import { SnackbarProvider } from "notistack";
import { createHashHistory } from "history";
import { Route, Router, Switch } from "react-router-dom";
import View from "./components/Links/View";

// const notistackRef = React.createRef() as any;
// const onClickDismiss = key => () => {
//   notistackRef.current.closeSnackbar(key);
// };
export const history = createHashHistory();
browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  ReactDOM.render(
    <Router history={history}>
      <Switch>
        <Route exact path="/ipfs/cat/:hash">
          <View />
        </Route>

        <Route path="/">
          <ThemeProvider theme={theme}>
            <SnackbarProvider
              maxSnack={7}
              preventDuplicate
              // ref={notistackRef}
              // action={key => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
            >
              <Tab />
            </SnackbarProvider>
          </ThemeProvider>
        </Route>
      </Switch>
    </Router>,
    document.getElementById("tab"),
  );
});
