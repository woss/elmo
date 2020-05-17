import { getValuesByKey, setValue } from "@src/databases/ChromeStorage";
import {
  DB_NAME_COLLECTIONS,
  DB_NAME_LINKS,
  withStore,
} from "@src/databases/OrbitDB";
import { ICollection, IKeyVal, ILink } from "@src/interfaces";
import { addFileToIPFS, calculateHash } from "@src/ipfsNode/helpers";
import nanoid from "nanoid";
import * as R from "ramda";
export async function createPageInstance(url: string): Promise<string> {
  const r = await fetch(url);

  if (!r.ok) {
    console.error("failed to get the url", url);
    return;
  }

  return await r.text();
}

export function toDocument(docString: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(docString, "text/html");
  return doc;
}

export function getPageTitle(doc: Document): string {
  return doc.querySelector("title")
    ? doc.querySelector("title").innerText
    : "Unknown";
}

export function createLink(d: IKeyVal | any): ILink {
  return Object.assign({}, d, { _id: nanoid() });
}

/**
 * Creates the link and returns its hash
 * @return hash
 * @param link
 * @param store
 */
export async function saveLink(link: ILink): Promise<string> {
  const store = withStore("links");
  store.load();
  try {
    console.time(`LINK:HELPER:: Adding link to OrbitDB ${link.hash}`);
    // await store.put({ ...link, _id: nanoid() }, { pin: true });
    await store.put(link, { pin: true });
    console.timeEnd(`LINK:HELPER:: Adding link to OrbitDB ${link.hash}`);
    return link.hash;
  } catch (e) {
    console.error(e);
    throw e.message;
  }
}
export async function saveCollectionToChromeStorage(c: ICollection) {
  console.time(
    `LINK:HELPER:: Adding/Updating collection to ChromeStorage ${c._id}`,
  );
  const all: ICollection[] = await getValuesByKey(DB_NAME_COLLECTIONS);

  const collections = all.map(collection => {
    if (c._id === collection._id) {
      return c;
    } else {
      return collection;
    }
  });

  await setValue({ [DB_NAME_COLLECTIONS]: collections });
  console.timeEnd(
    `LINK:HELPER:: Adding/Updating collection to ChromeStorage ${c._id}`,
  );
}

export async function saveLinkToChromeStorage(link: ILink) {
  console.time(`LINK:HELPER:: Adding link to ChromeStorage ${link.hash}`);
  const allLinks: ILink[] = await getValuesByKey(DB_NAME_LINKS);
  allLinks.push(link);
  await setValue({ [DB_NAME_LINKS]: allLinks });
  console.timeEnd(`LINK:HELPER:: Adding link to ChromeStorage ${link.hash}`);
}

export async function addToCollection(
  hash: string,
  collection: ICollection,
): Promise<ICollection> {
  if (!collection.links.includes(hash)) {
    const store = withStore(DB_NAME_COLLECTIONS);
    store.load();
    const links = collection.links.concat([hash]);
    const newCollection: ICollection = {
      ...collection,
      links,
    };

    console.time(
      `LINK:HELPER:: Adding link, hash ${hash}, to collection ${collection._id}`,
    );
    await store.put(newCollection, { pin: true });
    console.timeEnd(
      `LINK:HELPER:: Adding link, hash ${hash}, to collection ${collection._id}`,
    );

    await saveCollectionToChromeStorage(newCollection);

    return newCollection;
  } else {
    console.debug("LINK:HELPER:: Link in collection already, doing nothing.");
  }
}

export async function removeFromCollection(
  linkHash: string,
  collection: ICollection,
): Promise<ICollection> {
  const links = collection.links.filter(e => e !== linkHash);
  const newCollection: ICollection = {
    ...collection,
    links,
  };
  const store = withStore(DB_NAME_COLLECTIONS);
  store.load();
  await store.put(newCollection, { pin: true });
  return newCollection;
}

/**
 * Download the link,
 * save to IPFS
 * save to OrbitDB
 * save to ChromeStorage
 * @param url
 */
export async function downloadAndSaveLink(url: string): Promise<ILink> {
  const hash = await calculateHash(url); // must do this because we can easier get the hash from the url than whole content. popup must be lightweight

  const all: any[] = await getValuesByKey(DB_NAME_LINKS);

  const exists = R.includes({ hash: hash }, all);

  if (!exists) {
    const doc = await createPageInstance(url);
    const docObj = toDocument(doc);
    const title = getPageTitle(docObj);

    console.time(`LINK:HELPER:: Adding link to IPFS ${title}`);
    const { cid, path } = await addFileToIPFS(`${title}.html`, doc);
    console.timeEnd(`LINK:HELPER:: Adding link to IPFS ${title}`);

    const l = await createLink({
      createdAt: Date.now(),
      hash,
      title,
      url,
      ipfs: { cid, path },
    });

    await saveLink(l);

    await saveLinkToChromeStorage(l);
    return l;
  } else {
    console.log("LINK:HELPER:: Link exists, skip adding", all, hash);
    return all.find(a => a.hash === hash);
  }
}
