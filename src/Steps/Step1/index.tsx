import {
  Form,
  Button,
  CheckboxGroup,
  RadioGroup,
  Checkbox,
  Radio,
  Schema,
  CheckPicker,
  InputNumber,
  Panel,
  Slider,
  DatePicker,
  Message,
  toaster,
  FlexboxGrid,
  Input,
  Animation,
  SelectPicker,
} from "rsuite";
import React, { useEffect, useState } from "react";
import PurchasePlanTable from "../../components/Table/PuchasePlanTable";

const Field = React.forwardRef((props, ref) => {
  const { name, message, label, accepter, error, ...rest } = props;
  return (
    <Form.Group
      controlId={`${name}-10`}
      ref={ref}
      className={error ? "has-error" : ""}
    >
      <Form.ControlLabel>{label} </Form.ControlLabel>
      <Form.Control
        name={name}
        accepter={accepter}
        errorMessage={error}
        {...rest}
      />
      <Form.HelpText>{message}</Form.HelpText>
    </Form.Group>
  );
});

const { ArrayType, NumberType, StringType } = Schema.Types;
const model = Schema.Model({
  is_via_plan: StringType().isRequired("Поле обязательно для заполнения"),
  procedure_title: StringType().isRequired("Поле обязательно для заполнения"),
  skills: ArrayType()
    .minLength(2, "Please select at least 2 types of Skills.")
    .isRequired("This field is required."),
  status: ArrayType()
    .minLength(2, "Please select at least 2 types of Status.")
    .isRequired("This field is required."),
  level: NumberType().min(5, "This field must be greater than 5"),
});

const Step1 = () => {
  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    is_via_plan: "false",
    procedure_title: "",
    options: [
      "rnp_requirement_option",
      "smb_participant_option",
      "subcontractor_option",
    ],
  });

  const [selectedPlanPositions, setSelectedPlanPositions] = useState([]);

  const isViaPlan = formValue.is_via_plan === "true";

  const handleSubmit = () => {
    if (!formRef.current.check()) {
      toaster.push(<Message type="error">Error</Message>);
      return;
    }
    toaster.push(<Message type="success">Success</Message>);
  };

  useEffect(() => {
    if (selectedPlanPositions.length) {
      setFormValue((state) => ({
        ...state,
        procedure_title: selectedPlanPositions[0].title,
      }));
    }
  }, [selectedPlanPositions]);

  return (
    <div className="col-md-8">
      <Form
        ref={formRef}
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        model={model}
      >
        <Field
          name="is_via_plan"
          label=""
          accepter={RadioGroup}
          error={formError.is_via_plan}
          inline
        >
          <Radio value={"true"}>
            Заполнение сведений на основе плана закупок
          </Radio>
          <Radio value={"false"}>Заполнение сведений вручную</Radio>
        </Field>
        <Field
          name="purchase_plan_id"
          label="Выберите план закупки"
          accepter={SelectPicker}
          error={formError.purchase_plan_id}
          data={[
            { label: "План закупки (2023)", value: "321" },
            { label: "План закупки (2022)", value: "123" },
          ]}
        ></Field>
        <Animation.Collapse in={isViaPlan}>
          <Panel>
            <PurchasePlanTable
              selectedItems={selectedPlanPositions}
              setSelectedItems={setSelectedPlanPositions}
            />
          </Panel>
        </Animation.Collapse>
        <Field
          name="procedure_title"
          label="Наименование процедуры "
          accepter={Input}
          error={formError.procedure_title}
        />

        <Field
          name="options"
          label="Дополнительные опции"
          accepter={CheckboxGroup}
          error={formError.options}
        >
          <Checkbox value={"rnp_requirement_option"}>
            Требование об отсутствии сведений в РНП
          </Checkbox>
          <Checkbox value={"smb_participant_option"}>
            Участниками закупки могут быть только субъекты малого и среднего
            предпринимательства
          </Checkbox>
          <Checkbox value={"subcontractor_option"}>
            В отношении участников закупки установлено требование о привлечении
            к исполнению договора субподрядчиков (соисполнителей) из числа
            субъектов малого и среднего предпринимательства
          </Checkbox>
        </Field>
        <Form.Group>
          <Button appearance="primary" onClick={handleSubmit}>
            Далее
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step1;
