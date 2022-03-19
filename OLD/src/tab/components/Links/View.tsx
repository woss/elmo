import { Fade } from '@material-ui/core'
import { syncDbDataWithStorage } from '@src/databases/ChromeStorage'
import {
  DB_NAME_LINKS,
  openAllStores,
  startOrbitDBInstance,
  withStore,
} from '@src/databases/OrbitDB'
import { ILink } from '@src/interfaces'
import { startIpfsNode, useIpfsNode } from '@src/ipfsNode/ipfsFactory'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import RawHtml from 'react-raw-html'
import { useParams } from 'react-router-dom'

function getBaseURL(
  url: string,
): {
  parts: string[]
  url: string
} {
  const parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
  const parts = parse_url.exec(url)
  const result = parts[1] + ':' + parts[2] + parts[3] + '/'

  return {
    parts,
    url: result,
  }
}

/**
 * THIS IS WIP AND IT MIGHT NOT WORK FOR ALL THE WEBSITES
 */
function View() {
  const { hash } = useParams()

  const [ready, setReady] = useState(false)

  const [baseURL, setBaseURL] = useState('')
  const [content, setContent] = useState('')

  async function getContent() {
    const store = withStore(DB_NAME_LINKS)
    const { ipfs } = useIpfsNode()

    const [r] = (await store.get(hash)) as ILink[]
    if (r) {
      const c = await ipfs.cat(r.ipfs.cid)
      // const _content = toDocument(c.toString());
      // if slow try this https://www.w3schools.com/TAGs/tag_base.asp
      const bu = getBaseURL(r.url)

      // console.time("VIEW:: content replace");

      // const base = _content.createElement("base");
      // base.href = bu.url;
      // _content.head.appendChild(base);
      // const serializer = new XMLSerializer();
      // const s = serializer.serializeToString(_content);

      // replace "// to current protocol http(s)
      let re = new RegExp(`"//`, 'g')

      let s = c.toString().replace(re, `"${bu.parts[1]}://`)

      // relative links
      re = new RegExp(`"/`, 'g')
      s = s.replace(re, `"${bu.url}/`)

      // replaces the # links this will NOT work
      re = new RegExp(`"#`, 'g')
      s = s.replace(re, `"${r.url}#`)

      // console.timeEnd("VIEW:: content replace");
      setBaseURL(bu.url)
      setContent(s)
    }
  }
  useEffect(() => {
    startIpfsNode()
      .then(async () => {
        try {
          await startOrbitDBInstance()

          await openAllStores()

          // Sync latest DATA to the Storage
          await syncDbDataWithStorage()

          await getContent()

          setTimeout(() => setReady(true), 200)
        } catch (e) {
          console.error(e)
        }
      })
      .catch((e) => {
        console.error(e)
      })
  }, [])
  return (
    <Fade in={ready}>
      <div>
        <Helmet>
          <base href={baseURL} />
        </Helmet>
        {/* <pre>{content}</pre> */}
        <RawHtml.div>{content}</RawHtml.div>
      </div>
    </Fade>
  )
}

export default View
