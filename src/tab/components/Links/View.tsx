import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { withStore } from "@src/OrbitDB/OrbitDB";
import { ILink } from "@src/interfaces";
import { useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import RawHtml from "react-raw-html";
import { CssBaseline } from "@material-ui/core";

function View() {
    let { cid } = useParams();
    const store = withStore("links");
    const { ipfs } = useIpfsNode();
    const [link, setLink] = useState(null as ILink);
    const [content, setContent] = useState("");
    async function getContent() {
        const [r] = (await store.get(cid)) as ILink[];

        const c = await ipfs.cat(r.ipfs.cid);

        setContent(c.toString());
    }
    useEffect(() => {
        getContent();
    }, []);
    return (
        <div>
            <div>TITLE :{link && link.title}</div>
            <div className="content">
                <CssBaseline />
                <RawHtml.div>{content}</RawHtml.div>
            </div>
        </div>
    );
}

export default View;
