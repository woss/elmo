const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
// Create the first peer
async function main() {
  try {
    const ipfs1 = await IPFS.create({
      repo: './test/ipfs1',
      init: {
        emptyRepo: true,
      },
      config: {
        Addresses: {
          Swarm: ['/ip4/0.0.0.0/tcp/0', '/ip4/127.0.0.1/tcp/0/ws'],
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/127.0.0.1/tcp/0',
        },
        Bootstrap: [],
      },
    })

    // Create the database
    const orbitdb1 = await OrbitDB.createInstance(ipfs1, {
      directory: './test/orbitdb1',
    })

    const id1 = orbitdb1.identity.id
    const pubKey1 = orbitdb1.identity.publicKey

    let db1 = await orbitdb1.feed('events', {
      // accessController: {
      //   type: "orbitdb",
      //   write: [id1],
      // },
      // replicate: false,
      // meta: { hello: "meta hello" },
    })

    db1 = await orbitdb1.feed('events', {
      accessController: {
        type: 'orbitdb',
        write: [id1],
      },
      overwrite: true,
    })
    // Create the second peer
    const ipfs2 = await IPFS.create({
      repo: './test/ipfs2',
      init: {
        emptyRepo: true,
      },
      config: {
        Addresses: {
          Swarm: ['/ip4/0.0.0.0/tcp/0', '/ip4/127.0.0.1/tcp/0/ws'],
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/127.0.0.1/tcp/0',
        },
        Bootstrap: [],
      },
    })

    // Open the first database for the second peer,
    // ie. replicate the database
    const orbitdb2 = await OrbitDB.createInstance(ipfs2, {
      directory: './test/orbitdb2',
    })
    const id2 = orbitdb2.identity.id
    const pubKey2 = orbitdb2.identity.publicKey

    // db1 = await orbitdb1.create("events", "eventlog", {
    //   accessController: {
    //     write: [id1, id2],
    //   },
    //   // overwrite: true,
    //   // replicate: true,
    //   // meta: { hello: "meta hello" },
    // });
    // console.log("write", db1.get("write"));
    await db1.access.grant('write', id2)
    console.log(db1.access)
    const db2 = await orbitdb2.log(db1.address.toString())

    db1.drop()
    db2.drop()

    // When the second database replicated new heads, query the database
    db1.events.on('replicated', () => {
      const result = db2
        .iterator({ limit: -1 })
        .collect()
        .map((e) => e.payload.value)
      console.log('REPLICATED:: ', result.length)
    })

    // add one record
    await db1.add({ time: new Date().getTime() })

    // setInterval(async () => {
    //   //   await db1.add({ time: new Date().getTime() });
    //   await db2.add({ time: new Date().getTime() });
    // }, 1000);

    // process.exit(1);
    process.on('SIGINT', async () => {
      console.log('\nGracefully shutting down from SIGINT (Ctrl-C)')
      await ipfs1.stop()
      await ipfs2.stop()
      process.exit()
    })
  } catch (error) {
    console.error(error)
    await ipfs1.stop()
    await ipfs2.stop()
  }
}
main().catch(console.error)
