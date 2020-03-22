import { CssBaseline } from "@material-ui/core";
import { withStore } from "@src/databases/OrbitDB";
import { ILink } from "@src/interfaces";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
function View() {
  const { cid } = useParams();
  const store = withStore("links");

  const [link, setLink] = useState(null as ILink);

  async function getContent() {
    const [r] = (await store.get(cid)) as ILink[];

    setLink(r);
  }
  useEffect(() => {
    getContent();
  }, []);
  return (
    <div>
      <div>TITLE :{link && link.title}</div>
      <div>TODO add some info about the link.</div>
    </div>
  );
}

export default View;
