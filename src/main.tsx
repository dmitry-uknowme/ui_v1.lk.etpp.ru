import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { CustomProvider } from "rsuite";
import ru_RU from "rsuite/locales/ru_RU";
import Money from "./utils/money";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "rsuite/dist/rsuite.min.css";
import { ToastContainer } from "react-toastify";
window.Money = Money;
import { createCtx, connectLogger } from '@reatom/framework'
import { reatomContext } from '@reatom/npm-react'


const queryClient = new QueryClient();

const ctx = createCtx()
connectLogger(ctx)

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastContainer />
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <CustomProvider locale={ru_RU}>
        <reatomContext.Provider value={ctx}>
          <App />
        </reatomContext.Provider>
      </CustomProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
