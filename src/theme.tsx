import primaryColor from "@material-ui/core/colors/deepPurple";
import secondaryColor from "@material-ui/core/colors/orange";
import { createMuiTheme } from "@material-ui/core/styles";

const t = {
  palette: {
    // type: "light",
    type: "dark",
    primary: primaryColor,
    secondary: secondaryColor,
  },
};

export const theme = createMuiTheme(t as any);
// theme = responsiveFontSizes(theme);

window["theme"] = theme;

export default theme;
