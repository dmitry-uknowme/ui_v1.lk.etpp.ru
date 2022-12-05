import { useState, useEffect } from "react";
import fetchSession from "../../services/api/fetchSession";
import FormContext, { IMultiStepFormContext } from "./context";

interface MultiStepFormContextProviderProps {
  children: React.ReactNode;
}

const MultiStepFormContextProvider: React.FC<
  MultiStepFormContextProviderProps
> = ({ children }) => {
  const [formValues, setFormValues] = useState<
    IMultiStepFormContext["formValues"]
  >({});
  const [formErrors, setFormErrors] = useState<
    IMultiStepFormContext["formErrors"]
  >({});
  const [serverData, setServerData] = useState<
    IMultiStepFormContext["serverData"]
  >({});

  const initServerData = async () => {
    const session = await fetchSession();
    setServerData((state) => ({ ...state, session }));
  };

  useEffect(() => {
    initServerData();
  }, []);

  return (
    <FormContext.Provider
      value={{
        formValues,
        setFormValues,
        formErrors,
        setFormErrors,
        serverData,
        setServerData,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export default MultiStepFormContextProvider;
