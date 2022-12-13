import { useState, useEffect } from "react";
import { Message, toaster } from "rsuite";
import fetchSession from "../../services/api/fetchSession";
import FormContext, { IMultiStepFormContext } from "./context";

interface MultiStepFormContextProviderProps {
  children: React.ReactNode;
  currentStepId: number;
  setCurrentStepId: React.Dispatch<React.SetStateAction<number>>;
}

const MultiStepFormContextProvider: React.FC<
  MultiStepFormContextProviderProps
> = ({ children, currentStepId, setCurrentStepId }) => {
  const [formValues, setFormValues] = useState<
    IMultiStepFormContext["formValues"]
  >({});
  const [formErrors, setFormErrors] = useState<
    IMultiStepFormContext["formErrors"]
  >({});
  const [serverData, setServerData] = useState<
    IMultiStepFormContext["serverData"]
  >({});
  // const [currentStepId, setCurrentStepId] = useState<number>(0);
  const [isInited, setIsInited] = useState<boolean>(false);

  const initServerData = async () => {
    const session = await fetchSession();
    setServerData((state) => ({ ...state, session }));
    setIsInited(true);
  };

  useEffect(() => {
    if (isInited) {
      const session = serverData.session;
      console.log("ssss", session);
      // if (session) {
      if (!session || !session?.profile_id) {
        toaster.push(
          <Message type="error">Пользователь не авторизован</Message>
        );
      }
      if (!session?.cert_thumbprint) {
        toaster.push(
          <Message type="error">Не найден активный отпечаток подписи</Message>
        );
      }
      // }
    }
  }, [serverData, isInited]);

  useEffect(() => {}, [currentStepId]);

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
        currentStepId,
        setCurrentStepId,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export default MultiStepFormContextProvider;
