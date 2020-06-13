import { calculateHash } from "@src/ipfsNode/helpers";
import OrbitDB from "orbit-db";
import * as R from "ramda";
import {
  ICollection,
  IDatabaseDefinition,
  IOrbitDBItemBasicStructure,
  IOrbitDBOptions,
  IOrbitDBStoreType,
  IStoreInstance,
} from "../interfaces";
import { useIpfsNode } from "../ipfsNode/ipfsFactory";
import { getValuesByKey, setValue } from "./ChromeStorage";

//////////////////////////////////////
/// MAIN DB CACHE
//////////////////////////////////////
let storeInstance: IStoreInstance;

export const LOG_NAME = "ORBITDB";

export const DB_NAME_COLLECTIONS = "collections";
export const DB_NAME_LINKS = "links";
export const DB_NAME_USERS = "users";
export const DB_NAME_WORKSPACES = "workspaces";

export const DEFAULT_DATABASES: IDatabaseDefinition[] = [
  {
    dbName: DB_NAME_LINKS,
    options: { indexBy: "hash" },
    storeType: "docstore",
  },
  {
    dbName: DB_NAME_COLLECTIONS,
    options: {},
    storeType: "docstore",
  },
  // {
  //   dbName: DB_NAME_USERS,
  //   options: {},
  //   storeType: "docstore",
  // },
  // {
  //   dbName: DB_NAME_WORKSPACES,
  //   options: {},
  //   storeType: "docstore",
  // },
];

export function setDBsToInstance(dbs: IOrbitDBStoreType[]) {
  storeInstance.dbs = dbs;
}

/**
 * Cache the list of DBs to chrome storage for later retrieval and opening
 * @param dbs  Array<IDatabaseDefinition>
 */
async function setCreatedDatabasesToChromeStorage(dbs: IDatabaseDefinition[]) {
  return await setValue({ createdDBs: dbs });
}

/**
 * Retrieve all the DBs that we creates
 */
async function getCreatedStoresToChromeStorage(): Promise<
  IDatabaseDefinition[]
> {
  return await getValuesByKey("createdDBs");
}

export function generateStoreName(
  name: string,
  dbNamePrefix = "elmo",
  separator = ".",
): string {
  const prefix = [dbNamePrefix, separator].join("");
  if (!name.includes(prefix)) {
    return [prefix, name].join("");
  } else {
    return name;
  }
}
export function removeDbPrefix(
  name: string,
  dbNamePrefix = "elmo",
  separator = ".",
): string {
  const prefix = [dbNamePrefix, separator].join("");
  if (name.includes(prefix)) {
    const arr = name.split(separator);
    return arr[1];
  } else {
    return name;
  }
}

export function useDBNode(): IStoreInstance {
  if (!R.isEmpty(storeInstance)) {
    return storeInstance;
  } else {
    throw new Error("No connected OrbitDB nodes.");
  }
}

export async function startOrbitDBInstance(): Promise<IStoreInstance> {
  // create instance of the server
  const { ipfs } = useIpfsNode();

  if (!R.isNil(storeInstance)) {
    return storeInstance;
  } else {
    try {
      console.time(`${LOG_NAME}:: Start`);
      const node = await OrbitDB.createInstance(ipfs);
      console.timeEnd(`${LOG_NAME}:: Start`);

      storeInstance = {
        instance: node,
        id: node.identity.id,
        isOrbitDBReady: true,
        dbs: [],
      };
      return storeInstance;
    } catch (e) {
      console.error("Error in creating DB", e);
      storeInstance = {
        instance: null,
        id: "",
        isOrbitDBReady: false,
        dbs: [],
        error: e,
      };
      return storeInstance;
    }
  }
}

export function buildOptions(opts: IOrbitDBOptions = {}) {
  const { instance } = useDBNode();
  const defaultOptions: IOrbitDBOptions = {
    accessController: {
      // type: AccessControllerType.ORBITDB,
      write: [
        // Give access to ourselves
        instance.identity.id,
      ],
    },
    meta: { hello: "meta hello" },
  };
  const o = Object.assign({}, defaultOptions, opts);
  // console.log("Options", o.accessController.write, opts);
  return o;
}

/**
 * ELMO definition of the DB
 * @param s
 */
export function transformStoreToElmoDefinition(
  s: IOrbitDBStoreType,
): IDatabaseDefinition {
  const ret = {
    address: s.address.toString(),
    dbName: s.dbname,
    storeType: s._type,
    // options: {
    //   indexBy: s.options.indexBy,
    // },
    options: buildOptions({
      indexBy: s.options.indexBy,
      meta: {
        remote: true,
      },
    }),
  };
  return ret;
}
/**
 * Create ELMO Database definitions for export
 * @param dbs
 */
export function createStoreDefinitions(
  dbs: IOrbitDBStoreType[],
): IDatabaseDefinition[] {
  return Object.values(dbs).map(s => transformStoreToElmoDefinition(s));
}

const ops = [
  [
    "meta_lens_info",
    [["meta_copyright", [["perceptual_hash", [["meta_create_date"]]]]]],
  ],
  ["meta_lens_serial_number"],
  ["meta_lens_model"],
];

console.log(ops);

/**
 * Create Databases
 * @param dbs
 */
export async function createStores(
  dbs: IDatabaseDefinition[],
  remote = false,
): Promise<IStoreInstance> {
  const { instance } = useDBNode();
  console.time("Creating Stores");
  return Promise.all(
    // creates and opens the storeType database orbitdb.docstore(name,opts)
    // https://github.com/orbitdb/orbit-db/blob/master/API.md#orbitdbdocstorenameaddress-options
    dbs.map(db =>
      instance[db.storeType](
        remote ? db.address : db.dbName,
        !remote || db.options,
      ),
    ),
  ).then(async stores => {
    console.log("stores", stores);
    storeInstance.dbs = stores;
    console.timeEnd("Creating Stores");
    const d = createStoreDefinitions(stores);
    await setCreatedDatabasesToChromeStorage(d);
    return storeInstance;
  });
}

/**
 * Open Store by name
 * @param name
 */
export async function openStoreByName(
  name: string,
): Promise<IOrbitDBStoreType> {
  const dbs = await getCreatedStoresToChromeStorage();
  const { instance } = useDBNode();
  const db = dbs.find(d => d.dbName === generateStoreName(name));
  const open = await instance.open(db.address, {
    type: db.storeType,
    ...db.options,
  });
  await open.load();
  return open;
}

/**
 * Open single database, load from the disk as well
 * @param d IDatabaseDefinition
 */
export async function openStore(
  d: IDatabaseDefinition,
): Promise<IOrbitDBStoreType> {
  const { instance } = useDBNode();
  const open = await instance.open(d.address, {
    type: d.storeType,
    ...d.options,
  });
  await open.load();
  return open;
}

/**
 * Open Databases
 * @param dbs Array<IDatabaseDefinition>
 */
export async function openStores(
  dbs: IDatabaseDefinition[],
): Promise<IOrbitDBStoreType[]> {
  const s = await Promise.all(
    dbs.map(async db => {
      return await openStore(db);
    }),
  );
  setDBsToInstance(s);
  return s;
}
/**
 * Open ALL Databases
 * @param dbs Array<IDatabaseDefinition>
 */
export async function openAllStores() {
  const dbs = await getCreatedStoresToChromeStorage();

  if (!dbs || dbs.length === 0) return null;

  return await openStores(dbs);
}

/**
 * Create Default Databases
 * @param opts
 */
export async function createDefaultStores(opts: IOrbitDBOptions = {}) {
  const databases = DEFAULT_DATABASES.map(d => {
    return {
      dbName: generateStoreName(d.dbName),
      options: buildOptions({ ...opts, ...d.options }),
      storeType: d.storeType,
    };
  });

  const { dbs } = await createStores(databases);
  const d = createStoreDefinitions(dbs);
  await setCreatedDatabasesToChromeStorage(d);
}

/**
 * Return selected store (database)
 * @param name
 */
export function withStore(name: string): IOrbitDBStoreType {
  const dbName = generateStoreName(name);
  if (!R.isEmpty(storeInstance)) {
    const store = storeInstance.dbs.find(d => d.dbname === dbName);
    if (store) {
      return store;
    } else {
      throw new Error(
        `Store :: ${name} :: doesn't exist. Did you forget to open it?`,
      );
    }
  } else {
    throw new Error("No connected OrbitDB nodes.");
  }
}

export function sortByCreatedAt(
  d: IOrbitDBItemBasicStructure[],
  orderBy: "DESC" | "ASC" = "DESC",
): IOrbitDBItemBasicStructure[] {
  let r;

  if (orderBy === "DESC") {
    r = R.sortWith([R.descend(R.prop("createdAt"))]);
  } else {
    r = R.sortWith([R.ascend(R.prop("createdAt"))]);
  }
  // ramda way of creating functions.
  return r(d);
}

export async function loadAllFromStore(name: string): Promise<any[]> {
  console.time(`${LOG_NAME}:: loadAllFromStore(${name})`);
  const store = await openStoreByName(name);
  const res: any[] = await store.get("");
  const sorted = sortByCreatedAt(res, "DESC"); // DESC
  console.timeEnd(`${LOG_NAME}:: loadAllFromStore(${name})`);
  return sorted;
}

/**
 * Currently unused but good ref
 */
export function setupReplicationListeners() {
  const { dbs } = useDBNode();

  dbs.map(db => {
    db.events.on("peer", peer => {
      console.log("event peer", peer.id);
    });
    db.events.on("replicate.progress", () => {
      console.log(" event replicate.progress started", db);
    });
    db.events.on("replicate", address => {
      console.log(" event replication started  from address", address);
    });
    db.events.on("replicated", () => {
      console.log(" event Got replication for ", db);
    });
  });
  return dbs;
}

export async function addCollection(
  c: ICollection,
  pin = true,
): Promise<ICollection> {
  const store = withStore(DB_NAME_COLLECTIONS);
  // store.load();
  console.time(`ORBITDB:: Add collection ${c._id}`);
  await store.put(c, { pin });
  console.timeEnd(`ORBITDB:: Add collection ${c._id}`);

  return c;
}

/**
 * Rename the collection
 * @param c
 */
export async function renameCollection(c: ICollection): Promise<ICollection> {
  const store = withStore(DB_NAME_COLLECTIONS);
  const collection: ICollection = {
    ...c,
    hash: await calculateHash(c.title.trim()),
  };
  console.time(`Renaming collection ${c._id}`);
  await store.put(collection);
  console.timeEnd(`Renaming collection ${c._id}`);
  return collection;
}

export async function giveFullAccessToStores(dbId: string) {
  // Here is where we return the response back to the peer that wants to replicate the DB
  const { dbs: defaultStores, instance } = useDBNode();
  return Promise.all(
    defaultStores.map(async d => {
      d = await instance.create(d.dbname, d._type, {
        accessController: {
          write: [...d.options.accessController.write, dbId],
        },
        overwrite: true,
        replicate: true,
        meta: { hello: "meta hello", remote: true },
      });
      console.log(d);
      return d.access.grant("write", dbId);
    }),
  );
}
