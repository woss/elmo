import OrbitDB from "orbit-db";
import isEmpty from "lodash/isEmpty";
import {
  IDbInstance,
  IDatabaseDefinition,
  IOrbitDBOptions,
  AccessControllerType,
} from "../interfaces";
import { useIpfsNode } from "../ipfsNode/ipfsFactory";
import sortBy from "array-sort-by";

let dbInstance: IDbInstance;

export function generateDbName(
  name: string,
  dbNamePrefix = "elmo",
  separator = ".",
): string {
  return [dbNamePrefix, name].join(separator);
}

export async function startOrbitDBInstance(): Promise<IDbInstance> {
  // create instance of the server
  const { ipfs } = useIpfsNode();
  if (!isEmpty(dbInstance)) {
    console.log("OrbitDB instance found. Returning first");
    return dbInstance;
  } else {
    try {
      console.time("Start OrbitDB");
      const node = await OrbitDB.createInstance(ipfs);
      console.timeEnd("Start OrbitDB");

      dbInstance = {
        instance: node,
        id: node.identity.id,
        isOrbitDBReady: true,
        dbs: {},
      };

      return dbInstance;
    } catch (e) {
      console.log("Error in creating DB", e);
      dbInstance = {
        instance: null,
        id: "",
        isOrbitDBReady: false,
        dbs: {},
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

export async function createDbs(dbs: IDatabaseDefinition[]) {
  const { instance } = useDBNode();
  const dbsCreated = JSON.parse(localStorage.getItem("dbsCreated"));
  const forceDBsCreate = JSON.parse(localStorage.getItem("forceDBsCreate"));
  const dbsList: IDatabaseDefinition[] = JSON.parse(
    localStorage.getItem("dbsList"),
  );

  async function _create(dbs: IDatabaseDefinition[]) {
    console.time("Creating DBs");
    return Promise.all(
      dbs.map(db => instance[db.storeType](db.address, db.options)),
    ).then(stores => {
      return Promise.all(stores.map((store: any) => store.load())).then(d => {
        console.log("got stores", stores);
        // the load() modifies the actual store in prev call
        dbInstance.dbs = stores;
        console.timeEnd("Creating DBs");

        localStorage.setItem("dbsCreated", "true");
        // Orbit DB stores types can be found here
        // https://github.com/woss/orbit-db-types/blob/master/Store.d.ts
        const dbsList = createDatabaseDefinitions(stores);

        localStorage.setItem("dbsList", JSON.stringify(dbsList));

        return dbInstance;
      });
    });
  }
  if (!forceDBsCreate) {
    if (dbsCreated) {
      console.time("Opening DBs");
      console.debug("DBs found, loading them");

      // here we open the database
      const p = await Promise.all(
        dbsList.map(d =>
          // https://github.com/orbitdb/orbit-db/blob/master/API.md#orbitdbopenaddress-options
          instance.open(d.address, { type: d.storeType, ...d.options }),
        ),
      );

      // and now we load it from the disk
      await Promise.all(p.map(d => d.load()));

      console.timeEnd("Opening DBs");
      dbInstance.dbs = p;
      return dbInstance;
    } else {
      return await _create(dbs);
    }
  } else {
    return await _create(dbs);
  }
}

export function createDatabaseDefinitions(dbs: any[]): IDatabaseDefinition[] {
  return Object.values(dbs).map(s => transformStoreToElmoDefinition(s));
}

export function transformStoreToElmoDefinition(s: any): IDatabaseDefinition {
  console.log(s);
  return {
    address: s.address.toString(),
    storeType: s._type,
    options: {
      indexBy: s.options.indexBy,
    },
  };
}

export async function createDefaultDbs(opts: IOrbitDBOptions = {}) {
  console.debug("Creating default DBs");

  const databases: IDatabaseDefinition[] = [
    {
      address: generateDbName("links"),
      options: buildOptions({ ...opts, indexBy: "hash" }),
      storeType: "docstore",
    },
    {
      address: generateDbName("users"),
      options: buildOptions(opts),
      storeType: "docstore",
    },

    {
      address: generateDbName("collections"),
      options: buildOptions(opts),
      storeType: "docstore",
    },

    {
      address: generateDbName("workspaces"),
      options: buildOptions(opts),
      storeType: "docstore",
    },
  ];
  return createDbs(databases);
}

export function useDBNode(): IDbInstance {
  if (!isEmpty(dbInstance)) {
    return dbInstance;
  } else {
    throw new Error("No connected OrbitDB nodes.");
  }
}

export function withStore(name: string) {
  const dbName = generateDbName(name);
  if (!isEmpty(dbInstance)) {
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

export async function loadAllFromStore(name: string): Promise<any[]> {
  const store = withStore(name);
  const res: any[] = await store.get("");
  sortBy(res, item => -item.createdAt); // DESC
  return res;
}

/**
 * Currently unused but good ref
 */
export function setupReplicationListeners() {
  console.warn("DAngerous method");
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
