import React, { FunctionComponent } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";

import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import { browser } from "webextension-polyfill-ts";
import Header from "./components/Header/Header";
import Fab from "@material-ui/core/Fab";

import AddIcon from "@material-ui/icons/Add";
// IPFS setup

import useIpfsFactory from "../hooks/use-ipfs-factory";
import useIpfs from "../hooks/use-ipfs";
// import IpfsId from "./components/ipfs/Ipfs";

//

// test db
import TEST_DB from "@src/TEST_DB";
import Collections from "./components/Collections/Collections";
import IpfsInfo from "./components/ipfs/IpfsInfo";

const useStyles = makeStyles(theme => ({
    root: {},
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    fabButton: {
        position: "fixed",
        right: theme.spacing(3),
        bottom: theme.spacing(3),
    },
}));

export const Tab: FunctionComponent = () => {
    const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ["id"] });
    const classes = useStyles();

    React.useEffect(() => {
        browser.runtime.sendMessage({ tabMounted: true });
    }, []);

    const handleAddCollection = () => {
        console.log("should add collection");
    };
    // Renders the component tree
    return (
        <div className={classes.root}>
            <CssBaseline />
            <Header />
            {ipfsInitError && (
                <div className="bg-yellow pa4 mw7 center mv4 white">
                    Error: {ipfsInitError.message || ipfsInitError}
                </div>
            )}

            <main className={classes.content}>
                <Container>
                    {ipfs && <IpfsInfo ipfs={ipfs}></IpfsInfo>}
                    <Collections
                        collections={TEST_DB.collections}
                    ></Collections>
                </Container>
            </main>
            <div className={classes.fabButton}>
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleAddCollection}
                >
                    <AddIcon />
                </Fab>
            </div>
        </div>
    );
};

export default Tab;
