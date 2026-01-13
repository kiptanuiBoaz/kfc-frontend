import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import App from "./App";

import { Provider as ReduxProvider } from "react-redux";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { store } from "./redux/store";
import ThemeProvider from "./theme";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

root.render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LocalizationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ReduxProvider>
  </StrictMode>
);
