import { IIPFSPeer, IElmoIncomingMessage } from "@src/interfaces";
import { useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import { PeerInfo, IncomingMessage } from "@src/typings/ipfs-types";
import { useIpfs } from "@src/ipfsNode/use-ipfs";

export async function createChatListener(onMessage, peerId?: string) {
    const { ipfs } = useIpfsNode();
    try {
        const identity = await useIpfs("id");
        // connect to provided Peer ID or default local instance
        const topic = peerId ? peerId : identity.id;
        await ipfs.pubsub.subscribe(topic, onMessage);

        console.debug(`Subscribed to topic: ${topic}`);
        return {
            topic,
            unsubscribe: () => {
                console.debug(`Unsubscribing from topic: ${topic}`);
                ipfs.pubsub.unsubscribe(topic, onMessage);
            },
        };
    } catch (e) {
        console.error(e);
    }
}

export async function createDialer(dialer: IIPFSPeer, listener: IIPFSPeer) {}

export function formatMessage({
    data,
    from,
    topicIDs,
}: IncomingMessage): IElmoIncomingMessage {
    return {
        message: JSON.parse(bufferify(data).toString()),
        from: from,
        topics: topicIDs,
    };
}

/**
 * Create a buffer
 * @param s
 */
export const bufferify = (s: Buffer | string | number | Uint8Array): Buffer => {
    if (!Buffer.isBuffer(s)) {
        return Buffer.from(s.toString());
    }
    return s;
};
