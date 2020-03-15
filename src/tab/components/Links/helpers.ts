import { Tabs } from "webextension-polyfill-ts";
import { ILink, ICollection } from "@src/interfaces";
import { createCID } from "@src/ipfsNode/helpers";

import { withStore } from "@src/OrbitDB/OrbitDB";

export async function createPageInstance(url: string): Promise<string> {
    console.debug("createPageInstance:: Getting the page");
    const r = await fetch(url);

    if (!r.ok) {
        console.error("failed to get the url", url);
        return;
    }

    return await r.text();
}

export function toDocument(docString: string): Document {
    console.debug("createPageInstance:: Creating the DOMParser");
    const parser = new DOMParser();

    console.debug("createPageInstance:: Processing the DOMParser");
    const doc = parser.parseFromString(docString, "text/html");

    console.debug("createPageInstance:: Done");
    return doc;
}

export function getPageTitle(doc: Document): string {
    return doc.querySelector("title").innerText;
}

export async function createLinkObjectFromTab(tab: Tabs.Tab): Promise<ILink> {
    const link: ILink = {
        title: tab.title,
        url: tab.url.trim(),
        hash: await createCID(tab.url.trim()),
        createdAt: new Date().getTime(),
    };
    return link;
}

/**
 * Creates the link and returns its hash
 * @return hash
 * @param link
 * @param store
 */
export async function createLink(link: ILink): Promise<string> {
    const store = withStore("links");
    try {
        await store.put(link, { pin: true });
        return link.hash;
    } catch (e) {
        throw e.message;
    }
}

export async function addToCollection(
    linkHash: string,
    collection: ICollection,
): Promise<void> {
    if (!collection.links.includes(linkHash)) {
        const links = collection.links.concat([linkHash]);
        const newCollection: ICollection = {
            ...collection,
            links,
        };
        const store = withStore("collections");
        await store.put(newCollection, { pin: true });
    }
}

export async function removeFromCollection(
    linkHash: string,
    collection: ICollection,
): Promise<void> {
    const links = collection.links.filter(e => e !== linkHash);
    const newCollection: ICollection = {
        ...collection,
        links,
    };
    const store = withStore("collections");
    await store.put(newCollection, { pin: true });
}

export async function calculateHash(url: string): Promise<string> {
    return await createCID(url);
}
