import React, { useContext, useState } from "react";
import "./App.css";

import "../public/new_cryptopro/signlib";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProcedureCreate, {
  ProcedureFormActionVariants,
} from "./pages/ProcedureForm";
import ProcedureForm from "./pages/ProcedureForm";
import { LK_URL } from "./services/api";

window.signlib = signlib;
console.log("lk urllll ", LK_URL);
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          path="/procedure_create"
          element={
            <ProcedureForm action={ProcedureFormActionVariants.CREATE} />
          }
        />
        <Route
          index
          path="/procedure_edit/:procedure_id"
          element={<ProcedureForm action={ProcedureFormActionVariants.EDIT} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
