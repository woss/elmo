import React from "react";
import { useDBNode } from "@src/OrbitDB/OrbitDB";
import { Typography, Paper } from "@material-ui/core";

function Identity() {
    const { instance } = useDBNode();
    return (
        <Paper>
            <Typography>Database Identity</Typography>
            <div>ID: {instance.identity.id}</div>
            <div>
                <span>Use this key to give the access to another DB</span>
                Public Key: {instance.identity.publicKey}
            </div>
        </Paper>
    );
}

export default Identity;
