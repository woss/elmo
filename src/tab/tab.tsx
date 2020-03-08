import React, { FunctionComponent } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import { browser } from "webextension-polyfill-ts";
// IPFS setup

import useIpfsFactory from "../hooks/use-ipfs-factory";
import useIpfs from "../hooks/use-ipfs";
//

// test db
import TEST_DB from "@src/TEST_DB";
import Collections from "./components/Collections/Collections";

import Header from "./components/Header/Header";
import IpfsId from "./components/ipfs/Ipfs";

const useStyles = makeStyles(theme => ({
    root: {},
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

export const Tab: FunctionComponent = () => {
    // const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ["id"] });
    // const id = useIpfs(ipfs, "id");
    const classes = useStyles();

    React.useEffect(() => {
        browser.runtime.sendMessage({ tabMounted: true });
    }, []);

    // Renders the component tree
    return (
        <div className={classes.root}>
            <CssBaseline />
            <Header />
            {/* {ipfsInitError && (
                <div className="bg-yellow pa4 mw7 center mv4 white">
                    Error: {ipfsInitError.message || ipfsInitError}
                </div>
            )}
            {id && <IpfsId {...id} />} */}
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

export default Tab;
