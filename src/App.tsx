import React, { useState } from "react";
import { Button, ButtonGroup, Panel, Placeholder, Steps } from "rsuite";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Step1 from "./Steps/Step1";

function App() {
  const [step, setStep] = React.useState(0);
  const onChange = (nextStep) => {
    setStep(nextStep < 0 ? 0 : nextStep > 5 ? 5 : nextStep);
  };

  const onNext = () => onChange(step + 1);
  const onPrevious = () => onChange(step - 1);

  return (
    <div>
      {/* <div className="container-fluid"> */}
      <div className="row">
        <div className="col-md-3">
          <Steps current={step} vertical>
            <Steps.Item title="Основные сведения процедуры" />
            <Steps.Item title="Настройки хода процедуры" />
            <Steps.Item title="Сроки и порядок проведения" />
            <Steps.Item title="Лоты" />
            <Steps.Item title="Ответственные и приглашенные" />
            <Steps.Item title="Документация" />
          </Steps>
        </div>
        <div className="col-md-9">
          <hr />
          <Panel header={`Step: ${step + 1}`}>
            <Step1 />
          </Panel>
          <hr />
          <ButtonGroup>
            <Button onClick={onPrevious} disabled={step === 0}>
              Previous
            </Button>
            <Button onClick={onNext} disabled={step === 5}>
              Next
            </Button>
          </ButtonGroup>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

export default App;
