import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1E88E5" },
    secondary: { main: "#00BFA5" },
    warning: { main: "#F59E0B" },
    error: { main: "#D32F2F" },
    background: {
      default: "#F6F8FB",
      paper: "#FFFFFF"
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569"
    },
    divider: "#DCE3EC"
  },
  shape: {
    borderRadius: 14
  },
  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
    h4: { fontWeight: 800, letterSpacing: -0.4 },
    h5: { fontWeight: 750, letterSpacing: -0.3 },
    h6: { fontWeight: 700, letterSpacing: -0.2 },
    button: { textTransform: "none", fontWeight: 700 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    }
  }
});
