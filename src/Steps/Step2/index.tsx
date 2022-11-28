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
  Header,
  Stack,
} from "rsuite";
import React, { useEffect, useState } from "react";
import PurchasePlanTable from "../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlans from "../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../services/api/fetchPurchasePlan";
import fetchSession from "../../services/api/fetchSession";

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
});

const Step2 = ({ onNext, onPrevious }) => {
  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    accepting_bids_place: "ON_ETP",
    contract_conclude_place: "ON_ETP",
    participant_bid_type: "PRICE",
    procedure_title: "",
    procedure_section: "SECTION_FZ_223",
    procedure_method: "AUCTION",
    options: ["rnp_requirement_option"],
  });

  const isViaPlan = formValue.is_via_plan === "true";

  const purchasePlansQuery = useQuery(
    ["purchasePlans", isViaPlan],
    async () => {
      const result = await fetchPurchasePlans();
      if (isViaPlan) {
        setFormValue((state) => ({ ...state, purchase_plan_id: result[0].id }));
      }

      return result;
    }
  );

  const sessionQuery = useQuery("session", fetchSession);

  // const purchasePlanQuery = useQuery(
  //   ["purchasePlan", formValue.purchase_plan_id, isViaPlan],
  //   () =>
  //     formValue.purchase_plan_id.trim().length &&
  //     fetchPurchasePlan(formValue.purchase_plan_id)
  // );

  const [selectedPlanPositions, setSelectedPlanPositions] = useState([]);

  const handleSubmit = () => {
    onNext();
    // if (!formRef.current.check()) {
    //   toaster.push(<Message type="error">Error</Message>);
    //   return;
    // }
    // toaster.push(<Message type="success">Success</Message>);
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
        <Stack wrap spacing={50}>
          <Field
            name="accepting_bids_place"
            label="Прием заявок"
            accepter={RadioGroup}
            error={formError.accepting_bids_place}
            inline
          >
            <Radio value={"ON_ETP"}>На ЭТП</Radio>
            <Radio value={"OUT_ETP"}>Вне ЭТП</Radio>
          </Field>
          <Field
            name="contract_conclude_place"
            label="Договор заключается"
            accepter={RadioGroup}
            error={formError.contract_conclude_place}
            inline
          >
            <Radio value={"ON_ETP"}>На ЭТП</Radio>
            <Radio value={"OUT_ETP"}>Вне ЭТП</Radio>
          </Field>
        </Stack>
        <Field
          name="participant_bid_type"
          label="Тип предложения участников"
          accepter={RadioGroup}
          error={formError.participant_bid_type}
          inline
        >
          <Radio value={"PRICE"}>Ценновое предложение</Radio>
          <Radio value={"REDUCTION_RATIO"}>Коэффициент снижения</Radio>
          <Radio value={"REDUCTION_PERCENT"}>Процент снижения</Radio>
        </Field>

        <Field
          name="options"
          label="Дополнительные опции"
          accepter={CheckboxGroup}
          error={formError.options}
        >
          <Checkbox value={"bidding_per_position_option"}>
            Попозиционная закупка
          </Checkbox>
          <Checkbox value={"bidding_per_unit_option"}>
            Торги за единицу
          </Checkbox>
          <Checkbox value={"protocols_count_more_option"}>
            Количество публикуемых протоколов, согласно Положению Заказчика,
            более 1
          </Checkbox>
        </Field>
        <Form.Group>
          <Button onClick={onPrevious}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Далее
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step2;
