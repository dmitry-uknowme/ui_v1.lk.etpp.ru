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
import { format as formatDate } from "date-fns";
import React, { useContext, useEffect, useState } from "react";
import PurchasePlanTable from "../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlans from "../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../services/api/fetchPurchasePlan";
import fetchSession from "../../services/api/fetchSession";
import MultiStepFormContext from "../../context/multiStepForm/context";

const Field = React.forwardRef((props, ref) => {
  const { name, message, label, accepter, error, ...rest } = props;
  return (
    <Form.Group
      controlId={`${name}-10`}
      ref={ref}
      className={error ? "has-error" : ""}
    >
      <Form.ControlLabel>{label} </Form.ControlLabel>
      {rest.as === "textarea" ? (
        <Input as="textarea" name={name} {...rest} />
      ) : (
        <Form.Control
          name={name}
          accepter={accepter}
          errorMessage={error}
          {...rest}
        />
      )}

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
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    start_acceipting_bids_date: new Date(),
    end_acceipting_bids_date: new Date(),
    reviewing_bids_date: new Date(),
    summing_up_bids_date: new Date(),
    bidding_process: "В соответствии с закупочной документацией",
    order_review_and_summing_up: "В соответствии с закупочной документацией",
    place_review_and_summing_up: "В соответствии с закупочной документацией",
    procedure_process: "В соответствии с закупочной документацией",
    info_trading_venue: "В соответствии с закупочной документацией",
    providing_documentation_explanation:
      "В соответствии с закупочной документацией",
    requirements_participant: "В соответствии с закупочной документацией",
    provision_procurement_documentation:
      "В соответствии с закупочной документацией",
    other_info_by_customer: "В соответствии с закупочной документацией",
  });

  const isViaPlan = formValue.is_via_plan === "true";

  const purchasePlanQuery = useQuery(
    ["purchasePlan", formValue.purchase_plan_id],
    async () =>
      isViaPlan &&
      formValue.purchase_plan_id.trim().length &&
      (await fetchPurchasePlan(formValue.purchase_plan_id))
  );

  const sessionQuery = useQuery("session", fetchSession);

  const handleSubmit = () => {
    const {
      bidding_process,
      order_review_and_summing_up,
      place_review_and_summing_up,
      procedure_process,
      info_trading_venue,
      requirements_participant,
      providing_documentation_explanation,
      other_info_by_customer,
      provision_procurement_documentation,
    } = formValue;
    setFormGlobalValues((state) => ({
      ...state,
      bidding_process,
      order_review_and_summing_up,
      place_review_and_summing_up,
      procedure_process,
      info_trading_venue,
      providing_documentation_explanation,
      requirements_participant,
      provision_procurement_documentation,
      other_info_by_customer,
      lots: [
        ...formGlobalValues.lots,
        {
          name: formGlobalValues.name,
          //TODO:da
          positions: [],
          date_time: {
            start_bids: formatDate(
              formValue.start_acceipting_bids_date,
              "yyyy-MM-dd HH:mm:ss"
            ),
            close_bids: formatDate(
              formValue.end_acceipting_bids_date,
              "yyyy-MM-dd HH:mm:ss"
            ),
            review_bids: formatDate(
              formValue.reviewing_bids_date,
              "yyyy-MM-dd HH:mm:ss"
            ),
            summing_up_end: formatDate(
              formValue.summing_up_bids_date,
              "yyyy-MM-dd HH:mm:ss"
            ),
          },
        },
      ],
    }));
    onNext();
    // if (!formRef.current.check()) {
    //   toaster.push(<Message type="error">Error</Message>);
    //   return;
    // }
    // toaster.push(<Message type="success">Success</Message>);
  };

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
        <Panel>
          {/* <Stack wrap spacing={20}> */}
          <Field
            label="Порядок представления заявок на участие в закупке"
            name="bidding_process"
            accepter={Input}
            value={formValue.bidding_process}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Порядок рассмотрения заявок"
            name="order_review_and_summing_up"
            accepter={Input}
            value={formValue.order_review_and_summing_up}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Место рассмотрения заявок/подведения итогов"
            name="place_review_and_summing_up"
            accepter={Input}
            value={formValue.place_review_and_summing_up}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Порядок подведения итогов"
            name="procedure_process"
            accepter={Input}
            value={formValue.procedure_process}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Место проведения торгов"
            name="info_trading_venue"
            accepter={Input}
            value={formValue.info_trading_venue}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Сведения о порядке предоставления разъяснений на документацию"
            name="providing_documentation_explanation"
            accepter={Input}
            value={formValue.providing_documentation_explanation}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Требования к участникам"
            name="requirements_participant"
            accepter={Input}
            value={formValue.requirements_participant}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Срок, место и порядок предоставление документации о закупке"
            name="provision_procurement_documentation"
            accepter={Input}
            value={formValue.provision_procurement_documentation}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Иные сведения определяемые заказчиком"
            name="other_info_by_customer"
            accepter={Input}
            value={formValue.other_info_by_customer}
            onChange={(value) => setFormValue(value)}
            as="textarea"
            style={{ width: "100%" }}
          />
          {/* </Stack> */}
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
