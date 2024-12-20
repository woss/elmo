export interface ILink extends IOrbitDBItemBasicStructure {
  url: string
  hash: string // cid of url
  description?: string
  ipfs?: ILocalFileOnIPFS
}

export interface IWorkspace extends IOrbitDBItemBasicStructure {
  private: boolean
  current: boolean
  sharedWith?: IUser[]
}
export interface IUser extends IOrbitDBItemBasicStructure {
  email: string
  did: string
  permissions: string[]
}
export interface ICollection extends IOrbitDBItemBasicStructure {
  title: string
  userHash?: string
  links: string[]
  workspaces?: string[]
  sharedWith?: string[]
}

export interface IOrbitDBItemBasicStructure {
  _id: string // nanoid()
  title: string
  hash: string // CID
  createdAt: number //millis
}

export interface IStores {
  linkStore: any
  collectionStore: any
  userStore: any
  workspaceStore: any
}

export interface ILocalFileOnIPFS {
  path: string
  cid: string
}

export interface IIPFSInstance {
  id: string // for easier getting that's ipfs.id() => node.id
  ipfs: any
  isIpfsReady: boolean
  error?: Error
}

export interface IStoreInstance {
  instance: any
  id: string
  isOrbitDBReady: boolean
  dbs: IOrbitDBStoreType[]
  error?: Error
}

export interface IIPFSPeer {
  id: string
  privateKey: string
  publicKey: string
}

export interface IElmoGenericMessage {
  dbs?: IDatabaseDefinition[]
  all?: boolean
  dbID: string
  pubKey?: string
  nonce?: string
  message?: string
  action: IElmoMessageActions
}
export interface IElmoIncomingMessage {
  message: IElmoGenericMessage
  from: string
  topics: string[]
}

export interface IElmoMessage {
  action: IElmoMessageActions
}

export interface IOneParamFunction {
  (e: any): any
}
export interface IOneParamOptionalFunction {
  (e?: any): any
}
export interface INoParamFunction {
  (): any
}

export interface IDatabaseDefinition {
  dbName: string
  address?: string
  storeType: string
  options: IOrbitDBOptions
}

export interface IOrbitDBOptions {
  indexBy?: string
  accessController?: IOrbitDBAccessControllerOption
  overwrite?: boolean
}
export interface IOrbitDBAccessControllerOption {
  type?: AccessControllerType
  write?: string[]
}

export enum AccessControllerType {
  ORBITDB = 'orbitdb',
  OrbitDBAccessController = 'OrbitDBAccessController',
}

export enum IElmoMessageActions {
  REPLICATE_DB = 'replicateDB',
  APPROVE_REPLICATE_DB = 'approveReplicateDB',
  DECLINE_REPLICATE_DB = 'declineReplicateDB',
  PING = 'ping',
  PONG = 'pong',
}

// export enum IElmoMessageActions {
//   REPLICATE_DB,
//   APPROVE_REPLICATE_DB,
//   DECLINE_REPLICATE_DB,
// }

export interface IKeyVal {
  [key: string]: any
}

export interface IOrbitDBStoreType {
  id: string
  dbname: string
  options: {
    type: string
    accessController: { write: string[] }
    accessControllerAddress: string
    replicate: boolean
    indexBy: string
  }
  _type: string
  address: {
    root: string
    path: string
    toString: INoParamFunction
  }
  identity: any // TODO
  access: {
    grant: (e?: any, d?: any) => any
    write: any // TODO
  }
  events: any // TODO
  load: IOneParamOptionalFunction
  get: IOneParamOptionalFunction
  put: (e?: any, d?: any) => any
  del: (e?: any, d?: any) => any
}

export interface IAppState extends IKeyVal {
  continueToApp: boolean
}
