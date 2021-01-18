import { Grid } from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import { replaceKey } from '@src/databases/ChromeStorage'
import {
  addCollection,
  DB_NAME_COLLECTIONS,
  loadAllFromStore,
  withStore,
} from '@src/databases/OrbitDB'
import { ICollection } from '@src/interfaces'
import { createCID } from '@src/ipfsNode/helpers'
import nanoid from 'nanoid'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import Collection from './Collection'

const useStyles = makeStyles((theme) => ({
  root: {},
  loading: {
    width: 300,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  fabButton: {
    position: 'fixed',
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    zIndex: 1200,
  },
}))

export default function Collections() {
  const classes = useStyles()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const store = withStore(DB_NAME_COLLECTIONS)
  // const linksDB = withStore("links");

  const [disabled, setDisabled] = useState(false)

  const [collections, setCollections] = useState([] as ICollection[])

  async function createCollectionTemplate(): Promise<ICollection> {
    const collectionName = 'Collection ' + Math.round(Math.random() * 100)
    /**
     * helper function for collection creation
     */
    const collection: ICollection = {
      _id: nanoid(),
      hash: await createCID(collectionName),
      title: collectionName,
      links: [],
      sharedWith: [],
      // user: user._id,
      // workspaces: [currentWorkspace._id],
      createdAt: Date.now(),
    }
    return collection
  }

  async function handleAddCollection() {
    setDisabled(true)

    try {
      const collection = await createCollectionTemplate()
      const snackKey = enqueueSnackbar(`Adding ${collection.title}`, {
        variant: 'info',
        persist: true,
      })

      await addCollection(collection)

      closeSnackbar(snackKey)
      setDisabled(false)
    } catch (e) {
      console.error(e)
      enqueueSnackbar(e, {
        variant: 'error',
      })
      setDisabled(false)
    }
  }

  //////////////////////////////////////////
  ///  get default values and make binding
  /////////////////////////////////////////
  useEffect(() => {
    // must do this since we get false too

    loadAllFromStore(DB_NAME_COLLECTIONS).then((c) => {
      setCollections(c)
    })
    store.events.on('write', async (dbname, event) => {
      console.debug('COLLECTIONS:: write', dbname, event)

      const collections = await loadAllFromStore(DB_NAME_COLLECTIONS)
      await replaceKey(DB_NAME_COLLECTIONS, collections)
      setCollections(collections)
    })

    store.events.on('replicate', (address) => {
      console.debug('COLLECTIONS:: replication started', address)
    })
    store.events.on('replicated', async () => {
      console.debug('COLLECTIONS:: replicated')

      const c = await loadAllFromStore(DB_NAME_COLLECTIONS)
      setCollections(c)
    })

    // browser.runtime.onMessage.addListener(async r => {
    //   switch (r.action) {
    //     case "newCollection":
    //       const c = await loadAllFromStore(DB_NAME_COLLECTIONS);
    //       setCollections(c);
    //     default:
    //       break;
    //   }
    // });

    // return () => {
    //   browser.runtime.onMessage.removeListener(() =>
    //     console.log("removed listener"),
    //   );
    // };
  }, [])

  return (
    <div>
      <Grid container spacing={2} direction="column">
        {collections.map((c) => {
          return (
            <Grid item key={c._id}>
              <Collection data={c} id={c._id} />
            </Grid>
          )
        })}
      </Grid>
      <div className={classes.fabButton}>
        <Fab
          disabled={disabled}
          color="secondary"
          aria-label="Create Collection"
          className={classes.fabButton}
          onClick={handleAddCollection}
        >
          <AddIcon />
        </Fab>
      </div>
    </div>
  )
}
