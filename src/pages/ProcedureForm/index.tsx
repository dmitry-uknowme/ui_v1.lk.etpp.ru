import { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Button, Message, Steps, toaster } from "rsuite";
import MultiStepFormContextProvider from "../../context/multiStepForm/provider";
import fetchProcedure from "../../services/api/fetchProcedure";
import CurrentStep from "./Steps/CurrentStep";
import ShowResultModal from "./Steps/ShowResult";

export enum ProcedureFormActionVariants {
  CREATE = "CREATE",
  EDIT = "EDIT",
}

interface ProcedureFormProps {
  action: ProcedureFormActionVariants;
}

const ProcedureForm: React.FC<ProcedureFormProps> = ({ action }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (activeStep === 6) {
      setIsModalOpen(true);
    }
  }, [activeStep]);

  return (
    <div>
      <MultiStepFormContextProvider
        actionType={action}
        currentStepId={activeStep}
        setCurrentStepId={setActiveStep}
      >
        {/* <div className="container-fluid"> */}
        <div className="row">
          <div className="col-md-3">
            <Steps current={activeStep} vertical>
              <Steps.Item
                title="Основные сведения процедуры"
                style={{ cursor: "pointer" }}
                onClick={() => setActiveStep(0)}
              />
              <Steps.Item
                title="Настройки хода процедуры"
                style={{ cursor: "pointer" }}
                onClick={() => setActiveStep(1)}
              />
              <Steps.Item
                title="Сроки и порядок проведения"
                style={{ cursor: "pointer" }}
                onClick={() => setActiveStep(2)}
              />
              <Steps.Item title="Лоты" style={{ cursor: "pointer" }} onClick={() => setActiveStep(3)} />
              <Steps.Item
                title="Ответственные"
                // title="Ответственные и приглашенные"
                style={{ cursor: "pointer" }}
                onClick={() => setActiveStep(4)}
              />
              <Steps.Item title="Документация" style={{ cursor: "pointer" }} onClick={() => setActiveStep(5)} />
              <Steps.Item
                title="Предпросмотр извещения"
                onClick={() => setActiveStep(6)}
              // style={{ cursor: "pointer", display: "none" }}
              />
            </Steps>
            <Button
              appearance="ghost"
              color="blue"
              onClick={() => {
                window.localStorage.removeItem("formContext");
                window.location.reload();
              }}
            >
              Очистить поля формы
            </Button>
          </div>

          <div className="col-md-9">
            <hr />

            {/* <Panel header={`Шаг: ${step + 1}`}> */}
            {activeStep !== 6 ? <CurrentStep action={action} /> : null}
            {isModalOpen ? (
              <ShowResultModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
            ) : null}

            {/* </Panel> */}
            <hr />
          </div>
        </div>
      </MultiStepFormContextProvider>
      {/* </div> */}
    </div>
  );
};

export default ProcedureForm;
