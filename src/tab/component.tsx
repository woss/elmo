import React, { FunctionComponent } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import { browser } from "webextension-polyfill-ts";

// test db
import TEST_DB from "@src/TEST_DB";
import Collections from "./components/Collections/Collections";

import Header from "./components/Header/Header";

console.log("TEST DB", TEST_DB);

const useStyles = makeStyles(theme => ({
    root: {},
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

export const Tab: FunctionComponent = () => {
    const classes = useStyles();

    React.useEffect(() => {
        browser.runtime.sendMessage({ tabMounted: true });
    }, []);

    // Renders the component tree
    return (
        <div className={classes.root}>
            <CssBaseline />
            <Header />
            <main className={classes.content}>
                <Container>
                    <Collections
                        collections={TEST_DB.collections}
                    ></Collections>
                </Container>
            </main>
        </div>
    );
};
