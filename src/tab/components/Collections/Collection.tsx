import * as React from "react";
import Grid, { Typography } from "@material-ui/core";
import { ICollection } from "@src/interfaces";
import Links from "../Links/Links";

interface Props {
    collection: ICollection;
}
function Collection({ collection }: Props) {
    return (
        <div>
            <Typography>{collection.title}</Typography>
            <Links links={collection.links} />
        </div>
    );
}

export default Collection;
