import React, { useState } from "react";
import { useDBNode } from "@src/OrbitDB/OrbitDB";
import { Typography, Grid, TextField, Button } from "@material-ui/core";
import Identity from "./Identity";

function Database() {
    const { dbs } = useDBNode();
    // const [remoteDatabase, setRemoteDatabase] = useState(
    //     "/orbitdb/zdpuAx1BH1XzwjWvtSBuMUKmymTGy9Je7o23RnZf8aLk367Qm/elmo.collections",
    // );
    // defaultStores.collectionStore.events.on("peer", peer => {
    //     console.log(peer);
    // });
    // const stores = Object.entries(defaultStores);
    // function handleChange(e) {
    //     const id = e.target.id;
    //     const val = e.target.value;
    //     setRemoteDatabase(val);
    // }
    // async function handleConnect() {
    //     console.log("Connect to ", remoteDatabase);
    //     const db2 = await instance.docstore(remoteDatabase);

    //     // When the second database replicated new heads, query the database
    //     db2.events.on("replicated", () => {
    //         const result = db2.get("");

    //         result.map(r => {
    //             defaultStores.collectionStore
    //                 .put(r, { pin: true })
    //                 .then(r => console.log(r));
    //         });
    //     });
    // }
    return (
        <Grid>
            <Typography>Database Settings and Info</Typography>
            <Grid container>
                <Grid item>
                    <ul>
                        {dbs.map(store => {
                            return (
                                <li key={store.address.toString()}>
                                    name: {store.dbname}
                                    <br />
                                    address: {store.address.toString()}
                                </li>
                            );
                        })}
                    </ul>
                </Grid>
            </Grid>
            <Grid item>
                <Identity />
            </Grid>
        </Grid>
    );
}

export default Database;
