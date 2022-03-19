import IPFS from '@src/typings/ipfs'
import Room from 'ipfs-pubsub-room'

const NAMESPACE = 'ipfs-quick-msg'

const mkRoomName = (name: string) => {
  return `${NAMESPACE}-${name}`
}

export function createRoom(name: string, ipfs: IPFS, peersSet) {
  const room = new Room(ipfs, mkRoomName(name))

  room.on('peer joined', (peer) => {
    console.log('peer ' + peer + ' joined')
    peersSet.add(peer)
  })

  room.on('peer left', (peer) => {
    console.log('peer ' + peer + ' left')
    peersSet.delete(peer)
  })

  // send and receive messages
  room.on('message', (message) => {
    console.log('got message from ' + message.from + ': ' + message.data.toString())
  })

  return room
}
