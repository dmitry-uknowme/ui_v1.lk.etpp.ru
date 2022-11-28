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
  InputGroup,
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

const Step3 = ({ onNext, onPrevious }) => {
  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    start_acceipting_bids_date: new Date(),
    end_acceipting_bids_date: new Date(),
    reviewing_bids_date: new Date(),
    summing_up_bids_date: new Date(),
    lot_currency: "RUB",
    nds_type: "NO_NDS",
    participant_bid_type: "PRICE",
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
        <Panel header="Этапы проведения">
          <Stack wrap spacing={30}>
            <Field
              accepter={DatePicker}
              name="start_acceipting_bids_date"
              label="Дата и время начала подачи заявок"
              format="yyyy-MM-dd HH:mm"
              errorMessage={formError.createDate}
            />
            <Field
              accepter={DatePicker}
              name="end_acceipting_bids_date"
              label="Дата и время окончания подачи заявок"
              format="yyyy-MM-dd HH:mm"
              errorMessage={formError.createDate}
            />
            <Field
              accepter={DatePicker}
              name="reviewing_bids_date"
              label="Дата и время окончания подачи заявок"
              format="yyyy-MM-dd HH:mm"
              errorMessage={formError.createDate}
            />
            <Field
              accepter={DatePicker}
              name="summing_up_bids_date"
              label="Дата и время окончания подачи заявок"
              format="yyyy-MM-dd HH:mm"
              errorMessage={formError.createDate}
            />
          </Stack>
        </Panel>

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

export default Step3;
