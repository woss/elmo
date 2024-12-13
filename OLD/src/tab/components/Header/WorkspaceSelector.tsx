// import React from "react";
// import { Select, MenuItem, makeStyles, FormControl } from "@material-ui/core";
// import { IWorkspace } from "@src/interfaces";

// const useStyles = makeStyles(theme => ({
//   root: {
//     margin: theme.spacing(1),
//     color: theme.palette.primary.contrastText,
//   },
//   formControl: {
//     // margin: theme.spacing(1),
//     minWidth: 120,
//   },
// }));

// interface Props {
//   workspaces: IWorkspace[];
//   selectCurrentWorkspace: any;
// }

// function WorkspaceSelector({ selectCurrentWorkspace, workspaces }: Props) {
//   const classes = useStyles();
//   const defaultState: IWorkspace = {
//     _id: "",
//     hash: "",
//     name: "",
//     private: true,
//     current: false,
//     createdAt: 0,
//   };
//   const [current, setCurrent] = React.useState(defaultState);

//   React.useEffect(() => {
//     if (workspaces.length > 0) {
//       const curr: IWorkspace = workspaces.find(w => w.current);
//       setCurrent(curr);
//       selectCurrentWorkspace(curr._id);
//     }
//   });

//   if (!current) {
//     return null;
//   }

//   return (
//     <FormControl variant="outlined" className={classes.formControl}>
//       <Select
//         labelId="workspace-selector"
//         id="workspace-selector"
//         name="workspace-selector"
//         value={current._id}
//         onChange={e => selectCurrentWorkspace(e.target.value)}
//         className={classes.root}
//       >
//         {workspaces.map((v, k) => {
//           return (
//             <MenuItem key={k} value={v._id}>
//               {v.name}
//             </MenuItem>
//           );
//         })}
//       </Select>
//     </FormControl>
//   );
// }

// export default WorkspaceSelector;
