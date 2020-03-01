import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import primaryColor from "@material-ui/core/colors/deepPurple";
import secondaryColor from "@material-ui/core/colors/orange";

const t = {
    palette: {
        type: "dark",
        primary: primaryColor,
        secondary: secondaryColor,
    },
};

export const theme = createMuiTheme(t) as any;

window.theme = theme;
