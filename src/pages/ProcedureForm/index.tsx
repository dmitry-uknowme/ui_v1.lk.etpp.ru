import { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Message, Steps, toaster } from "rsuite";
import MultiStepFormContextProvider from "../../context/multiStepForm/provider";
import fetchProcedure from "../../services/api/fetchProcedure";
import CurrentStep from "./Steps/CurrentStep";

export enum ProcedureFormActionVariants {
  CREATE = "CREATE",
  EDIT = "EDIT",
}

interface ProcedureFormProps {
  action: ProcedureFormActionVariants;
}

const initProcedure = async (procedureId: string) => {
  const procedure = await fetchProcedure({ procedureId });
  return procedure;
};
const ProcedureForm: React.FC<ProcedureFormProps> = ({ action }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <div>
      <MultiStepFormContextProvider>
        {/* <div className="container-fluid"> */}
        <div className="row">
          <div className="col-md-3">
            <Steps current={activeStep} vertical>
              <Steps.Item
                title="Основные сведения процедуры"
                style={{ cursor: "pointer" }}
              />
              <Steps.Item
                title="Настройки хода процедуры"
                style={{ cursor: "pointer" }}
              />
              <Steps.Item
                title="Сроки и порядок проведения"
                style={{ cursor: "pointer" }}
              />
              <Steps.Item title="Лоты" style={{ cursor: "pointer" }} />
              <Steps.Item
                title="Ответственные"
                // title="Ответственные и приглашенные"
                style={{ cursor: "pointer" }}
              />
              <Steps.Item title="Документация" style={{ cursor: "pointer" }} />
            </Steps>
          </div>
          <div className="col-md-9">
            <hr />

            {/* <Panel header={`Шаг: ${step + 1}`}> */}
            {<CurrentStep action={action} />}
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
