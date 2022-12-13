import { useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Message, toaster } from "rsuite";
import { ProcedureFormActionVariants } from "../..";
import MultiStepFormContext, {
  IMultiStepFormContext,
} from "../../../../context/multiStepForm/context";
import fetchProcedure from "../../../../services/api/fetchProcedure";
import ShowResult from "../ShowResult";
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

  const Stepper = [Step1, Step2, Step3, Step4, Step5, Step6, ShowResult];
  const Step = Stepper[currentStepId];

  const nextStep = () => {
    // localStorage.setItem(
    //   "formContext",
    //   JSON.stringify({ formGlobalValues, formGlobalServerData, currentStepId })
    // );
    setCurrentStepId((state) => state + 1);
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

  const procedureQuery = useQuery(
    ["procedure", procedureId],
    async () => await fetchProcedure({ procedureId }),
    {
      enabled: !!(procedureId && action === ProcedureFormActionVariants.EDIT),
      onError: (err) =>
        toaster.push(<Message type="error">404. Процедура не найдена</Message>),
      onSuccess: (procedure) => {
        if (procedure) {
          // const procedure = procedureQuery.data;
          const organizer = procedure.organizer;
          const customer = procedure.customer;
          const lot = procedure.lots[0];
          console.log("ssssss", procedure, lot);
          setFormGlobalServerData((state) => ({
            ...state,
            actionType: action,
            procedureId: procedure.id,
          }));
          setFormGlobalValues((state) => ({
            ...state,
            plan_position_id: lot.plan_position_id ?? null,
            organizer: {
              inn: organizer.inn,
              // kpp: serverProcedure.organizer.kpp,
              short_title: organizer.inn,
              full_title: organizer.full_title,
              phone: organizer.phone_number,
              email: organizer.email,
              // TODO: kpp, address,
            },
            customer: {
              inn: customer.inn,
              // kpp: serverProcedure.organizer.kpp,
              short_title: customer.inn,
              full_title: customer.full_title,
              phone: customer.phone_number,
              email: customer.email,
              // TODO: kpp, address,
            },
            lots: [
              {
                date_time: {
                  start_bids: lot.start_bid_date,
                  close_bids: lot.close_bid_date,
                  review_bids: lot.close_bid_date,
                  summing_up_end: lot.summing_up_date,
                },
                name: procedure.name,
                starting_price: `${procedure.price_original.currency} ${procedure.price_original.amount}`,
              },
            ],
          }));
        }
      },
    }
  );

  // useEffect(() => {
  //   const savedFormContext = localStorage.getItem("formContext")
  //     ? (JSON.parse(
  //         localStorage.getItem("formContext")
  //       ) as IMultiStepFormContext)
  //     : null;
  //   if (savedFormContext as IMultiStepFormContext) {
  //     setTimeout(() => {
  //       setFormGlobalValues(savedFormContext?.formValues);
  //       setFormGlobalServerData(savedFormContext?.serverData);
  //       setFormGlobalServerData(savedFormContext?.currentStepId);
  //     }, 500);
  //   }
  // }, [currentStepId]);

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
