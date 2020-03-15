import IPFS from "./typings/ipfs-types";

export interface ILink {
    title: string;
    url: string;
    hash: string; // cid of url
    createdAt: number; //miliseconds
    description?: string;
    ipfs?: ILocalFileOnIPFS;
}
export interface IWorkspace {
    _id: string;
    hash: string; // CID(name)
    name: string;
    private: boolean;
    current: boolean;
    sharedWith?: IUser[];
    createdAt: number; //miliseconds
}
export interface IUser {
    _id: string;
    hash: string; // cid of email
    name: string;
    email: string;
    did: string;
    permissions: string[];
    createdAt: number; //miliseconds
}
export interface ICollection {
    _id: string;
    hash: string; // cid name
    title: string;
    userHash?: string;
    links: string[];
    workspaces?: string[];
    sharedWith?: string[];
    createdAt: number; //miliseconds
}

export interface IStores {
    linkStore: any;
    collectionStore: any;
    userStore: any;
    workspaceStore: any;
}

export interface ILocalFileOnIPFS {
    path: string;
    cid: string;
}

export interface IIPFSInstance {
    id: string; // for easier getting that's ipfs.id() => node.id
    ipfs: any;
    isIpfsReady: boolean;
    error?: Error;
}

export interface IDbInstance {
    instance: any;
    id: string;
    isOrbitDBReady: boolean;
    dbs: { [key: string]: any };
    error?: Error;
}

export interface IIPFSPeer {
    id: string;
    privateKey: string;
    publicKey: string;
}

export interface IElmoIncomingMessage {
    message: IElmoIncomingMessageReplicateDB;
    from: string;
    topics: string[];
}

export interface IElmoIncomingMessageReplicateDB {
    dbs?: IDatabaseDefinition[];
    all?: boolean;
    action: string;
    dbID: string;
}

export interface IOneParamFunction {
    (e: any): any;
}
export interface INoParamFunction {
    (): any;
}

export interface IDatabaseDefinition {
    address: string;
    storeType: "docstore" | "eventlog";
    options: IOrbitDBOptions;
}

export interface IOrbitDBOptions {
    indexBy?: string;
    accessController?: IOrbitDBAccessControllerOption;
}
export interface IOrbitDBAccessControllerOption {
    type: AccessControllerType;
    write?: string[];
}

export enum AccessControllerType {
    ORBITDB = "orbitdb",
    OrbitDBAccessController = "OrbitDBAccessController",
}
