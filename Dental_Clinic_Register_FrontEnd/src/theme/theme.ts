import { createTheme, ThemeOptions } from "@mui/material/styles";

const sharedTokens: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
};

export const darkThemeOptions: ThemeOptions = {
  ...sharedTokens,
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#aaaaaa",
    },
    primary: {
      main: "#90caf9",
    },
  },
  components: {
    MuiButton: { styleOverrides: { root: { fontWeight: "bold" } } },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", border: "1px solid #333333" },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { backgroundColor: "#2c2c2c" },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: { color: "#90caf9", "&:hover": { color: "#64b5f6" } },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: { backgroundColor: "transparent" },
      },
    },
  },
};

export const lightThemeOptions: ThemeOptions = {
  ...sharedTokens,
  palette: {
    mode: "light",
    background: {
      default: "#eef2f7",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a2e",
      secondary: "#4a5568",
    },
    primary: {
      main: "#1976d2",
    },
  },
  components: {
    MuiButton: { styleOverrides: { root: { fontWeight: "bold" } } },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #c8d3e0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { backgroundColor: "#f0f4f8" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
          border: "1px solid #c8d3e0",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: { color: "#1976d2", "&:hover": { color: "#1565c0" } },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: { backgroundColor: "transparent" },
      },
    },
  },
};

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme(mode === "dark" ? darkThemeOptions : lightThemeOptions);