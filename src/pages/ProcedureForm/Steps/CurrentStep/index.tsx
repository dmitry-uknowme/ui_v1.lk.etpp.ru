import { useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Message, toaster } from "rsuite";
import { ProcedureFormActionVariants } from "../..";
import MultiStepFormContext, {
  IMultiStepFormContext,
} from "../../../../context/multiStepForm/context";
import fetchProcedure from "../../../../services/api/fetchProcedure";
import Step1 from "../Step1";
import Step2 from "../Step2";
import Step3 from "../Step3";
import Step4 from "../Step4";
import Step5 from "../Step5";
import Step6 from "../Step6";

interface CurrentStepProps {
  action: ProcedureFormActionVariants;
}

const CurrentStep: React.FC<CurrentStepProps> = ({ action }) => {
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

  const params = useParams();
  const procedureId = params?.procedure_id;
  if (!procedureId) {
    return toaster.push(
      <Message type="error">404. Кажется вы заблудились</Message>
    );
  }

  const procedureQuery = useQuery(
    ["procedure", procedureId],
    async () => await fetchProcedure({ procedureId }),
    {
      enabled: !!(procedureId && action === ProcedureFormActionVariants.EDIT),
      onError: (err) =>
        toaster.push(
          <Message type="error">
            404. Кажется вы заблудились {JSON.stringify(err)}
          </Message>
        ),
    }
  );

  useEffect(() => {
    if (procedureQuery?.isError) {
      return toaster.push(
        <Message type="error">404. Кажется вы заблудились</Message>
      );
    }
    if (procedureQuery?.data) {
      const serverProcedure = procedureQuery.data;
      // console.log('ssssss',serverProcedure)
      setFormGlobalValues((state) => ({
        ...state,
        organizer: serverProcedure.customer,
      }));
    }
  }, [procedureQuery]);

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
