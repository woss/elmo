/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// source https://github.com/beenotung/typestub-ipfs/blob/master/index.d.ts

import { EventEmitter } from 'events'

export = IPFS

export as namespace ipfs

type Callback<T> = (error: Error, result?: T) => void

declare class IPFS extends EventEmitter {
  static enable: any
  constructor(options?: IPFS.Options)

  types: IPFS.Types

  init(options: IPFS.InitOptions, callback: Callback<boolean>): void
  init(callback: Callback<boolean>): void

  preStart(callback: Callback<any>): void
  start(callback?: Callback<any>): void
  stop(): Promise<void>
  isOnline(): boolean

  version(options: any, callback: (error: Error, version: IPFS.Version) => void): void
  version(options: any): Promise<IPFS.Version>
  version(callback: (error: Error, version: IPFS.Version) => void): void
  version(): Promise<IPFS.Version>

  id(options: any, callback: (error: Error, version: IPFS.Id) => void): void
  id(options: any): Promise<IPFS.Id>
  id(callback: (error: Error, version: IPFS.Id) => void): void
  id(): Promise<IPFS.Id>

  repo: IPFS.RepoAPI
  bootstrap: any
  config: any
  block: any
  object: IPFS.ObjectAPI
  dag: IPFS.DagAPI
  libp2p: any
  swarm: IPFS.SwarmAPI
  files: IPFS.FilesAPI
  bitswap: IPFS.Bitswap

  ping(callback: (error: Error) => void): void
  ping(): Promise<void>

  pubsub: IPFS.Pubsub

  on(event: string, callback: () => void): this
  on(event: 'error', callback: (error: { message: any }) => void): this
  once(event: string, callback: () => void): this
}

declare namespace IPFS {
  export interface Options {
    init?: boolean
    start?: boolean
    EXPERIMENTAL?: any
    repo?: string
    config?: any
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  type LogTypeFunction = Function

  export interface InitOptions {
    emptyRepo?: boolean
    bits?: number
    log?: LogTypeFunction
  }

  export interface Multiaddr {
    buffer: Uint8Array
  }

  export type Multihash = any | string
  export type CID = any

  export interface Types {
    Buffer: any
    PeerId: string | any
    PeerInfo: any
    multiaddr: Multiaddr
    multihash: Multihash
    CID: CID
  }

  export interface Version {
    version: string
    repo: string
    commit: string
  }

  export interface Id {
    id: string
    publicKey: string
    addresses: Multiaddr[]
    agentVersion: string
    protocolVersion: string
  }

  export interface RepoAPI {
    init(bits: number, empty: boolean, callback: Callback<any>): void

    version(options: any, callback: Callback<any>): void
    version(callback: Callback<any>): void

    gc(): void
    path(): string
  }

  export type FileContent = Record<string, any> | Blob | string

  /** old version? */
  export interface IPFSFile {
    path: string
    hash: string
    size: number
    content?: FileContent
  }

  export interface IPFSGetResult {
    depth: number
    name: string
    path: string
    size: number
    hash: Buffer
    content: Buffer
    type: 'file' | string
  }

  export interface FilesAPI {
    createAddStream(options: any, callback: Callback<any>): void
    createAddStream(callback: Callback<any>): void

    createPullStream(options: any): any

    add(data: FileContent, options: any, callback: Callback<IPFSFile[]>): void
    add(data: FileContent, options: any): Promise<IPFSFile[]>
    add(data: FileContent, callback: Callback<IPFSFile[]>): void
    add(data: FileContent): Promise<IPFSFile[]>

    cat(hash: Multihash, callback: Callback<FileContent>): void
    cat(hash: Multihash): Promise<FileContent>

    get(hash: Multihash, callback: Callback<IPFSFile | IPFSGetResult[]>): void
    get(hash: Multihash): Promise<IPFSFile | IPFSGetResult[]>

    getPull(hash: Multihash, callback: Callback<any>): void
  }

  export interface PeersOptions {
    v?: boolean
    verbose?: boolean
  }

  export type PeerId = any

  export interface PeerInfo {
    id: PeerId
    multiaddr: Multiaddr
    multiaddrs: Multiaddr[]
    distinctMultiaddr(): Multiaddr[]
  }

  export interface Peer {
    addr: Multiaddr
    peer: string
  }

  export interface SwarmAPI {
    peers(options: PeersOptions, callback: Callback<Peer[]>): void
    peers(options: PeersOptions): Promise<Peer[]>
    peers(callback: Callback<Peer[]>): void
    peers(): Promise<Peer[]>

    addrs(callback: Callback<PeerInfo[]>): void
    addrs(): Promise<PeerInfo[]>

    localAddrs(callback: Callback<Multiaddr[]>): void
    localAddrs(): Promise<Multiaddr[]>

    connect(maddr: Multiaddr | string, callback: Callback<any>): void
    connect(maddr: Multiaddr | string): Promise<any>

    disconnect(maddr: Multiaddr | string, callback: Callback<any>): void
    disconnect(maddr: Multiaddr | string): Promise<any>

    filters(callback: Callback<void>): never
  }

  export type DAGNode = any
  export type DAGLink = any
  export type DAGLinkRef = DAGLink | any
  export type Obj = BufferSource | Record<string, any>

  export interface ObjectStat {
    Hash: Multihash
    NumLinks: number
    BlockSize: number
    LinksSize: number
    DataSize: number
    CumulativeSize: number
  }

  export interface PutObjectOptions {
    enc?: any
  }

  export interface GetObjectOptions {
    enc?: any
  }

  export interface ObjectPatchAPI {
    addLink(
      multihash: Multihash,
      link: DAGLink,
      options: GetObjectOptions,
      callback: Callback<any>,
    ): void
    addLink(multihash: Multihash, link: DAGLink, options: GetObjectOptions): Promise<any>
    addLink(multihash: Multihash, link: DAGLink, callback: Callback<any>): void
    addLink(multihash: Multihash, link: DAGLink): Promise<any>

    rmLink(
      multihash: Multihash,
      linkRef: DAGLinkRef,
      options: GetObjectOptions,
      callback: Callback<any>,
    ): void
    rmLink(multihash: Multihash, linkRef: DAGLinkRef, options: GetObjectOptions): Promise<any>
    rmLink(multihash: Multihash, linkRef: DAGLinkRef, callback: Callback<any>): void
    rmLink(multihash: Multihash, linkRef: DAGLinkRef): Promise<any>

    appendData(
      multihash: Multihash,
      data: any,
      options: GetObjectOptions,
      callback: Callback<any>,
    ): void
    appendData(multihash: Multihash, data: any, options: GetObjectOptions): Promise<any>
    appendData(multihash: Multihash, data: any, callback: Callback<any>): void
    appendData(multihash: Multihash, data: any): Promise<any>

    setData(
      multihash: Multihash,
      data: any,
      options: GetObjectOptions,
      callback: Callback<any>,
    ): void
    setData(multihash: Multihash, data: any, options: GetObjectOptions): Promise<any>
    setData(multihash: Multihash, data: any, callback: Callback<any>): void
    setData(multihash: Multihash, data: any): Promise<any>
  }

  export interface ObjectAPI {
    'new'(template: 'unixfs-dir', callback: Callback<DAGNode>): void
    'new'(callback: Callback<DAGNode>): void
    'new'(): Promise<DAGNode>

    put(obj: Obj, options: PutObjectOptions, callback: Callback<any>): void
    put(obj: Obj, options: PutObjectOptions): Promise<any>
    put(obj: Obj, callback: Callback<any>): void
    put(obj: Obj): Promise<any>

    get(multihash: Multihash, options: GetObjectOptions, callback: Callback<any>): void
    get(multihash: Multihash, options: GetObjectOptions): Promise<any>
    get(multihash: Multihash, callback: Callback<any>): void
    get(multihash: Multihash): Promise<any>

    data(multihash: Multihash, options: GetObjectOptions, callback: Callback<any>): void
    data(multihash: Multihash, options: GetObjectOptions): Promise<any>
    data(multihash: Multihash, callback: Callback<any>): void
    data(multihash: Multihash): Promise<any>

    links(multihash: Multihash, options: GetObjectOptions, callback: Callback<DAGLink[]>): void
    links(multihash: Multihash, options: GetObjectOptions): Promise<DAGLink[]>
    links(multihash: Multihash, callback: Callback<DAGLink[]>): void
    links(multihash: Multihash): Promise<DAGLink[]>

    stat(multihash: Multihash, options: GetObjectOptions, callback: Callback<ObjectStat>): void
    stat(multihash: Multihash, options: GetObjectOptions): Promise<ObjectStat>
    stat(multihash: Multihash, callback: Callback<ObjectStat>): void
    stat(multihash: Multihash): Promise<ObjectStat>

    patch: ObjectPatchAPI
  }

  export interface DagAPI {
    put(dagNode: any, options: any, callback: Callback<any>): void
    put(dagNode: any, options: any): Promise<any>

    get(cid: string | CID, path: string, options: any, callback: Callback<any>): void
    get(cid: string | CID, path: string, options: any): Promise<any>
    get(cid: string | CID, path: string, callback: Callback<any>): void
    get(cid: string | CID, path: string): Promise<any>
    get(cid: string | CID, callback: Callback<any>): void
    get(cid: string | CID): Promise<any>

    tree(cid: string | CID, path: string, options: any, callback: Callback<any>): void
    qaz
    // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
    tree(cid: string | CID, path: string, options: any): Promise<any>
    tree(cid: string | CID, path: string, callback: Callback<any>): void
    tree(cid: string | CID, path: string): Promise<any>
    tree(cid: string | CID, options: any, callback: Callback<any>): void
    tree(cid: string | CID, options: any): Promise<any>
    tree(cid: string | CID, callback: Callback<any>): void
    tree(cid: string | CID): Promise<any>
  }

  export interface IncomingMessage {
    from: string
    seqno: Uint8Array
    data: Uint8Array
    key: Uint8Array
    signature: Uint8Array
    topicIDs: string[]
  }
  export interface Pubsub {
    subscribe(topic, handler: IncomingMessage, options: any, callback: Callback<any>): void
    subscribe(topic, handler: IncomingMessage, options: any): Promise<void>

    unsubscribe(topic, handler: IncomingMessage, callback: Callback<void>): void
    unsubscribe(topic, handler: IncomingMessage): Promise<void>

    publish(topic, data, callback: Callback<any>): void
    publish(topic, data): Promise<any>

    ls(callback: Callback<any>): void
    ls(): Promise<any>

    peers(topic, callback: Callback<any>): void
    peers(topic): Promise<any>

    setMaxListeners(n: number)
  }

  export interface WantListItem {
    '/': string
  }
  export interface WantList {
    Keys: WantListItem[]
  }

  /* class object */
  export type Big = any
  export interface Stat {
    provideBufLen: number
    blocksReceived: Big
    wantlist: WantListItem[]
    peers: string[]
    dupBlksReceived: Big
    dupDataReceived: Big
    dataReceived: Big
    blocksSent: Big
    dataSent: Big
  }

  export type KeyType = string | Buffer | CID | any
  export interface Bitswap {
    wantlist(peerId: string, callback: Callback<WantList>): void
    wantlist(peerId: string): Promise<WantList>
    wantlist(callback: Callback<WantList>): void
    wantlist(): Promise<WantList>

    stat(callback: Callback<Stat>): void
    stat(): Promise<Stat>

    unwant(keys: KeyType | KeyType[], callback: Callback<any>): void
    unwant(keys: KeyType | KeyType[]): Promise<any>
  }

  export function createNode(options: Options): IPFS

  export function createAddStream(options: any, callback: Callback<any>): void
  export function createAddStream(callback: Callback<any>): void

  export function createPullStream(options: any): any

  export function add(data: FileContent, options: any, callback: Callback<IPFSFile[]>): void
  export function add(data: FileContent, options: any): Promise<IPFSFile[]>
  export function add(data: FileContent, callback: Callback<IPFSFile[]>): void
  export function add(data: FileContent): Promise<IPFSFile[]>

  export function cat(hash: Multihash, callback: Callback<FileContent>): void
  export function cat(hash: Multihash): Promise<FileContent>

  export function get(hash: Multihash, callback: Callback<IPFSFile | IPFSGetResult[]>): void
  export function get(hash: Multihash): Promise<IPFSFile | IPFSGetResult[]>

  export function getPull(hash: Multihash, callback: Callback<any>): void
}
