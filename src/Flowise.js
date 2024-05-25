import * as React from "react";
import { lazy, useEffect } from "react";
import { useSelector } from "react-redux";

import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, StyledEngineProvider } from "@mui/material";

// defaultTheme
import themes from "./themes";

// project imports
import NavigationScroll from "./layout/NavigationScroll";

import Loadable from "./ui-component/loading/Loadable";
const Canvas = Loadable(lazy(() => import("./views/canvas")));
// ==============================|| APP ||============================== //

const Flowise = () => {
  const customization = useSelector((state) => state.customization);

  useEffect(() => {
    const receiveMessage = (event) => {
      const message = event.data;
      console.log("Received message:", message);
      if (message) {
        const token = message.authToken;
        const transformerId = message.transformerId;
        const botId = message.botId;
        if (token) sessionStorage.setItem("auth", token);
        if (botId) sessionStorage.setItem("botId", botId);
        if (transformerId)
          sessionStorage.setItem("transformerId", transformerId);
        // Validate and use the token as needed
      }
    };

    window.addEventListener("message", receiveMessage);

    // Cleanup
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          <Canvas />
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default Flowise;
