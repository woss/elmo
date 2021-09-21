import { CID } from 'multiformats/cid'
import * as codec from '@ipld/dag-cbor'
import { sha256 as hasher } from 'multiformats/hashes/sha2'
import * as Block from 'multiformats/block'

// import slug from 'slug'
import { ILocalFileOnIPFS } from '@src/interfaces'
import { useIpfsNode } from '@src/ipfsNode/ipfsFactory'

// slug.defaults.mode = 'rfc3986'

export const DEFAULT_HASH_ALG = 'blake2b-256'

export async function createCID(data: string): Promise<string> {
  // const hash = await hasher.digest(Buffer.from(data))
  const block = await Block.encode({ value: Buffer.from(data), codec, hasher })

  // const cid = new CID(1, 0x70, hash, Buffer.from(data))
  console.log(block.cid.toString())

  return block.cid.toString()
}

export async function addFileToIPFS(path: string, content: string): Promise<ILocalFileOnIPFS> {
  const opts = {
    cidVersion: 1,
    hashAlg: DEFAULT_HASH_ALG,
    pin: true,
  }
  const node = useIpfsNode()
  // version 0.40

  const results: any[] = await node.ipfs.add(
    {
      // path: slug(path, { lower: true }),
      path,
      content,
    },
    opts,
  )

  return { path: results[0].path, cid: results[0].hash }
  // if version 0.41 then it's CID, version 0.40 has hash
  // for await (const result of ipfs.add(
  //     {
  //         path: slug(path, { lower: true }),
  //         content,
  //     },
  //     opts,
  // )) {
  //     console.log(result.path, result.cid.toString());
  //     // if version 0.41 then it's CID, version 0.40 has hash
  //     // return { path: result.path, cid: result.cid.toString() };
  // }
}

export async function calculateHash(url: string): Promise<string> {
  return await createCID(url)
}
