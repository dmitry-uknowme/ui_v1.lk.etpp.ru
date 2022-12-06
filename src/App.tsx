import React, { useState } from "react";
import { Button, ButtonGroup, Panel, Placeholder, Steps } from "rsuite";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Step1 from "./Steps/Step1";
import Step2 from "./Steps/Step2";
import Step3 from "./Steps/Step3";
import Step4 from "./Steps/Step4";
import Step6 from "./Steps/Step6";
import Step5 from "./Steps/Step5";
import FormContextProvider from "./context/multiStepForm/provider";

function App() {
  const [step, setStep] = React.useState(0);
  const onChange = (nextStep) => {
    setStep(nextStep < 0 ? 0 : nextStep > 5 ? 5 : nextStep);
  };

  const onNext = () => onChange(step + 1);
  const onPrevious = () => onChange(step - 1);
  const Stepper = [Step1, Step2, Step3, Step4, Step5, Step6];
  const CurrentStep = Stepper[step];
  return (
    <div>
      {/* <div className="container-fluid"> */}
      <div className="row">
        <div className="col-md-3">
          <Steps current={step} vertical>
            <Steps.Item
              title="Основные сведения процедуры"
              style={{ cursor: "pointer" }}
              onClick={() => onChange(0)}
            />
            <Steps.Item
              title="Настройки хода процедуры"
              style={{ cursor: "pointer" }}
              onClick={() => onChange(1)}
            />
            <Steps.Item
              title="Сроки и порядок проведения"
              style={{ cursor: "pointer" }}
              onClick={() => onChange(2)}
            />
            <Steps.Item
              title="Лоты"
              style={{ cursor: "pointer" }}
              onClick={() => onChange(3)}
            />
            <Steps.Item
              title="Ответственные"
              // title="Ответственные и приглашенные"
              style={{ cursor: "pointer" }}
              onClick={() => onChange(4)}
            />
            <Steps.Item
              title="Документация"
              style={{ cursor: "pointer" }}
              onClick={() => onChange(5)}
            />
          </Steps>
        </div>
        <div className="col-md-9">
          <hr />
          <FormContextProvider>
            <Panel header={`Шаг: ${step + 1}`}>
              {<CurrentStep onNext={onNext} onPrevious={onPrevious} />}
            </Panel>
          </FormContextProvider>
          <hr />
          {/* <ButtonGroup>
            <Button onClick={onPrevious} disabled={step === 0}>
              Назад
            </Button>
            <Button appearance="primary" onClick={onNext} disabled={step === 5}>
              Далее
            </Button>
          </ButtonGroup> */}
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

export default App;
