import { IKeyVal } from "@src/interfaces";
import { isNil } from "ramda";
import { browser } from "webextension-polyfill-ts";
import { loadAllFromStore, removeDbPrefix, useDBNode } from "./OrbitDB";

export async function getValuesByKey(s?: string) {
  // console.log("CHROME_STORAGE:: getValuesByKey", s
  if (isNil(s)) {
    return await browser.storage.local.get(s);
  } else {
    // todo for string and string[] cases
    const r = await browser.storage.local.get(s);
    const result = r[s];

    return result;
  }
}

export async function setValue(s: IKeyVal) {
  return await browser.storage.local.set(s);
}

export async function removeValue(s: string | string[]) {
  return await browser.storage.local.remove(s);
}

export async function clear() {
  return await browser.storage.local.clear();
}

export async function replaceKey(key: string, c: any) {
  return await setValue({ [key]: c });
}

/**
 * Init the Chrome storage with current DBs and the data
 * Main reason is that popup.html can be as fast as possible
 */
export async function syncDbDataWithStorage() {
  const { dbs } = useDBNode();

  // Chrome storage sync
  // Check what do we have in the storage already
  // const storage = await getValuesByKey();
  // console.log(await getValuesByKey());
  if (dbs.length === 0) {
    return null;
  }
  console.time("ChromeStorage:: SYNC USER DATABASES");
  return await Promise.all(
    dbs.map(async ({ dbname }) => {
      const c = await loadAllFromStore(dbname);
      const name = removeDbPrefix(dbname);
      return setValue({ [name]: c });
    }),
  ).then(() => {
    console.timeEnd("ChromeStorage:: SYNC USER DATABASES");
  });
}

/**
 * Use this to init the WHOLE app state
 */

export async function initChromeStorage() {
  return await setValue({
    appInitialized: false,
  });
}
