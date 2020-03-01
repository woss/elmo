import * as React from "react";
import { ICollection } from "@src/interfaces";
import Collection from "./Collection";
import { Grid } from "@material-ui/core";

interface Props {
    collections: [ICollection];
}

const Collections = ({ collections }: Props) => {
    return (
        <Grid>
            {collections.map((collection, key) => {
                return <Collection key={key} collection={collection} />;
            })}
        </Grid>
    );
};

export default Collections;
