import { bufferify } from '@src/helpers'
import { IElmoIncomingMessage, IKeyVal } from '@src/interfaces'
import { useIpfsNode } from '@src/ipfsNode/ipfsFactory'
import { useIpfs } from '@src/ipfsNode/use-ipfs'
import { IncomingMessage } from '@src/typings/ipfs'

export async function createChatListener(onMessage, peerId?: string) {
  const { ipfs } = useIpfsNode()
  try {
    const identity = await useIpfs('id')
    // connect to provided Peer ID or default local instance
    const topic = peerId ? peerId : identity.id
    await ipfs.pubsub.subscribe(topic, onMessage)

    console.log(`Subscribed to topic: ${topic}`)
    return {
      topic,
      unsubscribe: () => {
        console.log(`Unsubscribing from topic: ${topic}`)
        ipfs.pubsub.unsubscribe(topic, onMessage)
      },
    }
  } catch (e) {
    console.error(e)
  }
}

export function formatMessage({
  data,
  from,
  topicIDs,
  key,
  signature,
}: IncomingMessage): IElmoIncomingMessage {
  return {
    message: JSON.parse(bufferify(data).toString()),
    from: from,
    topics: topicIDs,
    key: key ? key.toString() : '',
    signature: signature.toString(),
  }
}

export function createBrowserRuntimeMessage(action: string, payload: IKeyVal = {}) {
  return { action, payload }
}
