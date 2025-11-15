import { createContext, useContext } from "react";

const ThemeContext = createContext({
  theme: {
    background: "#F5F5F5",
    surface: "#FFFFFF",
    card: "#D1D1D6",
    text: "#000000",
  },
});

export const ThemeProvider = ({ children }) => {
  const theme = {
    background: "#F5F5F5",
    surface: "#FFFFFF",
    card: "#D1D1D6",
    text: "#000000",
  };

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
