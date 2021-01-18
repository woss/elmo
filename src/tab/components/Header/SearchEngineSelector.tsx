import React, { useState } from 'react'
import { Select, MenuItem, makeStyles, FormControl } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  select: {
    margin: theme.spacing(1),
    color: theme.palette.primary.contrastText,
    padding: 0,
  },
  formControl: {
    height: theme.spacing(6),
    margin: 0,
    '& > *': {
      margin: 0,
    },
  },
  item: {
    height: theme.spacing(5),
    padding: 0,
  },
}))

export const searchEngines = [
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    icon: 'https://img.icons8.com/ios/36/000000/duckduckgo.png',
  },
  {
    id: 'local',
    name: 'Local',
    icon: 'https://img.icons8.com/ios/36/000000/search-more.png',
  },
]
function SearchEngineSelector({ selectCurrentEngine, current }) {
  const classes = useStyles()

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <Select
        labelId="search-engine-selector"
        id="search-engine-selector"
        name="search-engine-selector"
        value={current}
        onChange={(e) => selectCurrentEngine(e.target.value as string)}
        className={classes.select}
      >
        {searchEngines.map((v, k) => {
          return (
            <MenuItem className={classes.item} key={k} value={v.id}>
              <img src={v.icon} />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

export default SearchEngineSelector
