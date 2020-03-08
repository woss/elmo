import React from "react";
import { Typography } from "@material-ui/core";

export const IpfsId = props => {
    if (!props) return null;
    return (
        <div className="bg-snow mw7 center mt5">
            <h1 className="f3 fw4 ma0 pv3 aqua montserrat tc" data-test="title">
                Connected to IPFS
            </h1>
            <div className="pa4">
                {["id", "agentVersion"].map(key => (
                    <div className="mb4" key={key}>
                        <Typography>{key}</Typography>
                        <div
                            className="bg-white pa2 br2 truncate monospace"
                            data-test={key}
                        >
                            {props[key]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default IpfsId;
