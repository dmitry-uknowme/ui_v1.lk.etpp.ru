import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { CustomProvider } from "rsuite";
import ru_RU from "rsuite/locales/ru_RU";
import Money from "./utils/money";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "rsuite/dist/rsuite.min.css";
window.Money = Money;
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <CustomProvider locale={ru_RU}>
        <App />
      </CustomProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
