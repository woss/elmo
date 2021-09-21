import Checkbox from '@material-ui/core/Checkbox'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { ICollection } from '@src/interfaces'
import { calculateHash } from '@src/ipfsNode/helpers'
import React, { useEffect } from 'react'
import browser, { Tabs } from 'webextension-polyfill'

interface Props {
  collection: ICollection
  currentTab: Tabs.Tab
}

function PopupCollection({ collection, currentTab }: Props) {
  const [checked, setChecked] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  async function handleToggle() {
    setDisabled(true)
    const hash = await calculateHash(currentTab.url)

    // Link exists, remove
    if (checked) {
      // now we are doing uncheck, remove
      // !TODO fix me
      // browser.runtime.sendMessage(
      //   createBrowserRuntimeMessage("removeLink", {
      //     linkHash: hash,
      //     collection,
      //   }),
      // );
    } else {
      // browser.runtime.sendMessage(
      //   createBrowserRuntimeMessage("saveLink", {
      //     url: currentTab.url,
      //     collection,
      //   }),
      // );
    }
  }

  useEffect(() => {
    if (currentTab) {
      calculateHash(currentTab.url).then(async (hash) => {
        if (collection.links.includes(hash)) setChecked(true)
      })
    }
  }, [currentTab])

  useEffect(() => {
    browser.runtime.onMessage.addListener((r) => {
      // we must check that current collection is the only one that needs to make changes
      // because this listener is created for EVERY collection in popup
      if (r.payload && r.payload.collection && r.payload.collection._id === collection._id) {
        switch (r.action) {
          case 'linkRemovedFromCollection':
            setChecked(false)
            setDisabled(false)
            break

          case 'linkSaved':
            console.log(`POPUP_COLLECTION:: action ${r.action}`, r.payload)
            setChecked(true)
            setDisabled(false)
            break

          default:
            break
        }
      }
    })
    return () => {
      browser.runtime.onMessage.removeListener(() => console.log('removed'))
    }
  }, [])

  return (
    <ListItem dense button disabled={disabled} onClick={handleToggle}>
      <ListItemIcon>
        <Checkbox
          edge='start'
          checked={checked}
          tabIndex={-1}
          disableRipple
          color='primary'

        // inputProps={{ "aria-labelledby": labelId }}
        />
      </ListItemIcon>
      <ListItemText primary={collection.title} />
    </ListItem>
  )
}

export default PopupCollection
