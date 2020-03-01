import * as React from "react";
import { ILink } from "@src/interfaces";

import TEST_DB from "@src/TEST_DB";

const dbLinks = TEST_DB.links;

interface Props {
    linkId: number;
}
function Link({ linkId }: Props) {
    const link: ILink = dbLinks[linkId];

    if (!link) {
        return null;
    }
    return <div>{link.title}</div>;
}

export default Link;
