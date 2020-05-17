import React from "react";
import MaterialList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { ListItemText } from "@material-ui/core";
import { isUndefined } from "lodash";
interface Props {
  data: any[];
  transformValue?: any;
  classes: {
    [key: string]: any;
  };
  dense?: boolean;
}
function CustomList(props: Props) {
  const { classes, data, transformValue, dense = true } = props;

  return (
    <div className={classes.root}>
      <MaterialList dense={dense}>
        {data.map((v, k) => {
          return (
            <ListItem key={k}>
              <ListItemText
                className={classes.text}
                primary={isUndefined(transformValue) ? v : transformValue(v)}
              />
            </ListItem>
          );
        })}
      </MaterialList>
    </div>
  );
}

export default CustomList;
