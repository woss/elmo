import { Button, Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import { fade, makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
  },
  logo: {
    color: "inherit",
  },
  actionLinks: {
    margin: theme.spacing(1),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    // display: "flex",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(3),
    width: "auto",
    [theme.breakpoints.up("xl")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("xl")]: {
      width: 200,
    },
  },
  sectionDesktop: {
    // display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
}));

function Header() {
  const classes = useStyles();
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const [current, setCurrent] = useState(searchEngines[0].id);

  // const ipfsInstance = useIpfsFactory({ commands: ["id"] });
  // const { isOrbitDBReady, databases } = useOrbitDBFactory({
  //     ipfs: ipfsInstance.ipfs,
  //     ipfsReady: ipfsInstance.isIpfsReady,
  // });

  // const open = Boolean(anchorEl);
  // const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
  //     setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //     setAnchorEl(null);
  // };
  // useEffect(()=>{

  // }, isOrbitDBReady)
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography className={classes.title} variant="h6" noWrap>
          <Button className={classes.logo} component={RouterLink} to="/">
            ELMO - Links and more
          </Button>
        </Typography>
        {/* <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <SearchIcon />
                    </div>
                    <SearchEngineSelector
                        selectCurrentEngine={setCurrent}
                        current={current}
                    />
                    <InputBase
                        placeholder="Search…"
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        inputProps={{ "aria-label": "search" }}
                        onClick={() => {
                            console.log("fuzzy search here");
                        }}
                        onChange={e => {
                            console.log("Search term: ", e.target.value.trim());
                        }}
                    />
                </div> */}
        <div className={classes.grow} />
        {/* <WorkspaceSelector
                    workspaces={workspaces}
                    selectCurrentWorkspace={currentWorkspaces}
                ></WorkspaceSelector> */}
        <div className={classes.sectionDesktop}>
          <Button
            className={classes.actionLinks}
            variant="contained"
            component={RouterLink}
            to="/links"
          >
            Links
          </Button>
          <Button
            className={classes.actionLinks}
            variant="contained"
            component={RouterLink}
            to="/"
          >
            Collections
          </Button>
          <Button
            className={classes.actionLinks}
            variant="contained"
            component={RouterLink}
            to="/ipfs"
          >
            IPFS
          </Button>
          <Button
            className={classes.actionLinks}
            variant="contained"
            component={RouterLink}
            to="/db"
          >
            OrbitDB
          </Button>
          <Button
            className={classes.actionLinks}
            variant="contained"
            component={RouterLink}
            to="/ahh-the-choices"
          >
            Choices
          </Button>

          {/* <IconButton aria-label="show 4 new mails" color="inherit">
                        <Badge badgeContent={4} color="secondary">
                            <MailIcon />
                        </Badge>
                    </IconButton>
                    <IconButton
                        aria-label="show 17 new notifications"
                        color="inherit"
                    >
                        <Badge badgeContent={17} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton> */}
          {/* {user && (
                        <div>

                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleClose}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
                                    My account
                                </MenuItem>
                            </Menu>
                        </div>
                    )} */}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
