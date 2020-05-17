import OrbitDB from "orbit-db";
import * as R from "ramda";
import {
  IDbInstance,
  IDatabaseDefinition,
  IOrbitDBOptions,
  IOrbitDBItemBasicStructure,
  IOrbitDBStoreType,
  ICollection,
} from "../interfaces";
import { useIpfsNode } from "../ipfsNode/ipfsFactory";
import { getValuesByKey, setValue } from "./ChromeStorage";
import { calculateHash } from "@src/ipfsNode/helpers";

//////////////////////////////////////
/// MAIN DB CACHE
//////////////////////////////////////
let dbInstance: IDbInstance;

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

function setDBsToInstance(dbs: IOrbitDBStoreType[]) {
  dbInstance.dbs = dbs;
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
async function getCreatedDatabasesToChromeStorage(): Promise<
  IDatabaseDefinition[]
> {
  return await getValuesByKey("createdDBs");
}

export function generateDbName(
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

export function useDBNode(): IDbInstance {
  if (!R.isEmpty(dbInstance)) {
    return dbInstance;
  } else {
    throw new Error("No connected OrbitDB nodes.");
  }
}

export async function startOrbitDBInstance(): Promise<IDbInstance> {
  // create instance of the server
  const { ipfs } = useIpfsNode();

  if (!R.isNil(dbInstance)) {
    console.log("OrbitDB instance found. Returning first");
    return dbInstance;
  } else {
    try {
      console.time(`${LOG_NAME}:: Start`);
      const node = await OrbitDB.createInstance(ipfs);
      console.timeEnd(`${LOG_NAME}:: Start`);

      dbInstance = {
        instance: node,
        id: node.identity.id,
        isOrbitDBReady: true,
        dbs: [],
      };

      return dbInstance;
    } catch (e) {
      console.log("Error in creating DB", e);
      dbInstance = {
        instance: null,
        id: "",
        isOrbitDBReady: false,
        dbs: [],
        error: e,
      };
      return dbInstance;
    }
  }
}

export function buildOptions(opts: IOrbitDBOptions = {}) {
  const { instance } = useDBNode();
  const defaultOptions: IOrbitDBOptions = {
    accessController: {
      // type: AccessControllerType.ORBITDB,
      write: [instance.identity.id],
    },
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
  return {
    address: s.address.toString(),
    dbName: s.dbname,
    storeType: s._type,
    options: {
      indexBy: s.options.indexBy,
    },
  };
}
/**
 * Create ELMO Database definitions for export
 * @param dbs
 */
export function createDatabaseDefinitions(
  dbs: IOrbitDBStoreType[],
): IDatabaseDefinition[] {
  return Object.values(dbs).map(s => transformStoreToElmoDefinition(s));
}

/**
 * Create Databases
 * @param dbs
 */
export async function createDbs(
  dbs: IDatabaseDefinition[],
): Promise<IDbInstance> {
  const { instance } = useDBNode();

  console.time("Creating DBs");
  return Promise.all(
    dbs.map(db => instance[db.storeType](db.dbName, db.options)),
  ).then(stores => {
    return Promise.all(stores.map((store: any) => store.load())).then(
      async () => {
        // the load() modifies the actual store in prev call
        dbInstance.dbs = stores;
        console.timeEnd("Creating DBs");

        return dbInstance;
      },
    );
  });
}

/**
 * Open single database, load from the disk as well
 * @param d IDatabaseDefinition
 */
export async function openDatabase(
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
export async function openDatabases(
  dbs: IDatabaseDefinition[],
): Promise<IOrbitDBStoreType[]> {
  const s = await Promise.all(
    dbs.map(async db => {
      return await openDatabase(db);
    }),
  );
  setDBsToInstance(s);
  return s;
}
/**
 * Open ALL Databases
 * @param dbs Array<IDatabaseDefinition>
 */
export async function openAllDatabases() {
  const dbs = await getCreatedDatabasesToChromeStorage();

  const s = await Promise.all(
    dbs.map(async db => {
      return await openDatabase(db);
    }),
  );
  setDBsToInstance(s);
  return s;
}

export async function createDefaultDbs(opts: IOrbitDBOptions = {}) {
  const databases = DEFAULT_DATABASES.map(d => {
    return {
      dbName: generateDbName(d.dbName),
      options: buildOptions({ ...opts, ...d.options }),
      storeType: d.storeType,
    };
  });

  const { dbs } = await createDbs(databases);
  const d = createDatabaseDefinitions(dbs);
  await setCreatedDatabasesToChromeStorage(d);
}

export function withStore(name: string): IOrbitDBStoreType {
  const dbName = generateDbName(name);
  if (!R.isEmpty(dbInstance)) {
    const store = dbInstance.dbs.find(d => d.dbname === dbName);
    if (store) {
      return store;
    } else {
      throw new Error(`Store :: ${name} :: doesn't exist.`);
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
  const store = withStore(name);
  await store.load();
  const res: any[] = await store.get("");
  const sorted = sortByCreatedAt(res, "DESC"); // DESC
  console.timeEnd(`${LOG_NAME}:: loadAllFromStore(${name})`);
  return sorted;
}

/**
 * Currently unused but good ref
 */
export function setupReplicationListeners() {
  console.warn("Dangerous method");
  return null;
  const { dbs } = useDBNode();

  dbs.map(db => {
    // db.events.on("peer", peer => {
    //     console.log("event peer", peer.id);
    // });
    // db.events.on("replicate.progress", () => {
    //     console.log(" event replicate.progress started", db);
    // });
    db.events.on("replicate", address => {
      console.log(" event replication started  from address", address);
    });
    db.events.on("replicated", () => {
      console.log(" event Got replication for ", db);
    });
  });
  return dbs;
}

export async function addCollection(c: ICollection): Promise<ICollection> {
  console.log("Adding collection");
  const store = withStore(DB_NAME_COLLECTIONS);
  // store.load();
  console.time(`ORBITDB:: Add collection ${c._id}`);
  await store.put(c, { pin: true });
  console.timeEnd(`ORBITDB:: Add collection ${c._id}`);

  return c;
}

export async function renameCollection(c: ICollection): Promise<ICollection> {
  const store = withStore(DB_NAME_COLLECTIONS);
  const collection: ICollection = {
    ...c,
    hash: await calculateHash(c.title.trim()),
  };
  console.time(`Renaming collection ${c._id}`);
  await store.put(collection, { pin: true });
  console.timeEnd(`Renaming collection ${c._id}`);
  return collection;
}
