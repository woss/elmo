// @flow strict

import React from "react";
import useIpfsEffect from "@src/ipfsNode/use-ipfs";
import { Typography } from "@material-ui/core";

function Config() {
    const config = useIpfsEffect("config.get");

    return (
        <div style={{ overflow: "auto" }}>
            <Typography variant="h6">Config</Typography>
            <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
    );
}

export default Config;
