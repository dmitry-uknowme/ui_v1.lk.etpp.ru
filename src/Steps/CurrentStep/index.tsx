import { useContext, useEffect } from "react";
import MultiStepFormContext, {
  IMultiStepFormContext,
} from "../../context/multiStepForm/context";
import Step1 from "../Step1";
import Step2 from "../Step2";
import Step3 from "../Step3";
import Step4 from "../Step4";
import Step5 from "../Step5";
import Step6 from "../Step6";

const CurrentStep = () => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
    currentStepId,
    setCurrentStepId,
  } = useContext(MultiStepFormContext);

  const Stepper = [Step1, Step2, Step3, Step4, Step5, Step6];
  const Step = Stepper[currentStepId];

  const nextStep = () => {
    // localStorage.setItem(
    //   "formContext",
    //   JSON.stringify({ formGlobalValues, formGlobalServerData, currentStepId })
    // );
    setTimeout(() => setCurrentStepId((state) => state + 1), 500);
  };
  const prevStep = () => {
    // localStorage.setItem(
    //   "formContext",
    //   JSON.stringify({ formGlobalValues, formGlobalServerData, currentStepId })
    // );
    setCurrentStepId((state) => state - 1);
  };

  useEffect(() => {
    setTimeout(() => {
      localStorage.setItem(
        "formContext",
        JSON.stringify({
          formGlobalValues,
          formGlobalServerData,
          currentStepId,
        })
      );
    }, 500);
  }, [formGlobalValues]);

  //   useEffect(() => {
  //     const savedFormContext = localStorage.getItem("formContext")
  //       ? (JSON.parse(
  //           localStorage.getItem("formContext")
  //         ) as IMultiStepFormContext)
  //       : null;
  //     if (savedFormContext as IMultiStepFormContext) {
  //       setTimeout(() => {
  //         setFormGlobalValues(savedFormContext?.formValues);
  //         setFormGlobalServerData(savedFormContext?.serverData);
  //         setFormGlobalServerData(savedFormContext?.currentStepId);
  //       }, 500);
  //     }
  //   }, [currentStepId]);

  return (
    <Step
      currentStep={currentStepId}
      setCurrentStep={setCurrentStepId}
      nextStep={nextStep}
      prevStep={prevStep}
    />
  );
};

export default CurrentStep;
