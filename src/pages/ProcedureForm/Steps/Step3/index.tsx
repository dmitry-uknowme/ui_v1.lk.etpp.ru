import {
  Form,
  Button,
  Schema,
  Panel,
  DatePicker,
  Input,
  Stack,
  toaster,
  Message,
} from "rsuite";
import { add, format as formatDate } from "date-fns";
import React, { useContext, useEffect, useState } from "react";
import PurchasePlanTable from "../../../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlan from "../../../../services/api/fetchPurchasePlan";
import MultiStepFormContext from "../../../../context/multiStepForm/context";

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

const { ArrayType, NumberType, StringType, DateType } = Schema.Types;

const Step3 = ({ currentStep, setCurrentStep, nextStep, prevStep }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    start_acceipting_bids_date:
      formGlobalValues?.lots?.length &&
        formGlobalValues?.lots[0]?.date_time?.start_bids
        ? new Date(formGlobalValues?.lots[0]?.date_time?.start_bids)
        : add(new Date(), { minutes: 1 }),
    // : new Date(),
    end_acceipting_bids_date:
      formGlobalValues?.lots?.length &&
        formGlobalValues?.lots[0]?.date_time?.close_bids
        ? new Date(formGlobalValues?.lots[0]?.date_time?.close_bids)
        : // : new Date(),
        add(new Date(), { minutes: 2 }),
    reviewing_bids_date:
      formGlobalValues?.lots?.length &&
        formGlobalValues?.lots[0]?.date_time?.review_bids
        ? new Date(formGlobalValues?.lots[0]?.date_time?.review_bids)
        : // : new Date(),
        add(new Date(), { minutes: 3 }),
    summing_up_bids_date:
      formGlobalValues?.lots?.length &&
        formGlobalValues?.lots[0]?.date_time?.summing_up_end
        ? new Date(formGlobalValues?.lots[0]?.date_time?.summing_up_end)
        : // : new Date(),
        add(new Date(), { minutes: 4 }),
    bidding_process:
      formGlobalValues?.bidding_process ||
      "В соответствии с закупочной документацией",
    order_review_and_summing_up:
      formGlobalValues?.order_review_and_summing_up ||
      "В соответствии с закупочной документацией",
    place_review_and_summing_up:
      formGlobalValues?.place_review_and_summing_up ||
      "В соответствии с закупочной документацией",
    procedure_process:
      formGlobalValues?.procedure_process ||
      "В соответствии с закупочной документацией",
    info_trading_venue:
      formGlobalValues?.info_trading_venue ||
      "В соответствии с закупочной документацией",
    providing_documentation_explanation:
      formGlobalValues?.providing_documentation_explanation ||
      "В соответствии с закупочной документацией",
    requirements_participant:
      formGlobalValues?.requirements_participant ||
      "В соответствии с закупочной документацией",
    provision_procurement_documentation:
      formGlobalValues?.provision_procurement_documentation ||
      "В соответствии с закупочной документацией",
    other_info_by_customer:
      formGlobalValues?.other_info_by_customer ||
      "В соответствии с закупочной документацией",
  });

  const schema = {
    start_acceipting_bids_date: DateType().min(
      new Date(),
      "Дата начала подачи заявок не может быть раньше текущего времени"
    ),
    end_acceipting_bids_date: DateType().min(
      new Date() > formValue.start_acceipting_bids_date
        ? add(formValue.start_acceipting_bids_date, { minutes: 1 })
        : add(new Date(), { minutes: 1 }),
      new Date() > formValue.start_acceipting_bids_date
        ? "Дата окончания подачи заявок не может быть раньше текущего времени"
        : "Дата окончания подачи заявок не может быть раньше даты начала рассмотрения заявок"
    ),
    reviewing_bids_date: DateType().min(
      new Date() > formValue.end_acceipting_bids_date
        ? add(formValue.end_acceipting_bids_date, { minutes: 1 })
        : add(new Date(), { minutes: 1 }),
      new Date() > formValue.end_acceipting_bids_date
        ? "Дата начала рассмотрения заявок не может быть раньше текущего времени"
        : "Дата начала рассмотрения заявок не может быть раньше даты окончания подачи заявок"
    ),
    summing_up_bids_date: DateType().min(
      new Date() > formValue.reviewing_bids_date
        ? add(formValue.reviewing_bids_date, { minutes: 1 })
        : add(new Date(), { minutes: 1 }),
      new Date() > formValue.reviewing_bids_date
        ? "Дата подведения итогов не может быть раньше текущего времени"
        : "Дата подведения итогов не может быть раньше даты начала рассмотрения заявок"
    ),
  };

  const model = Schema.Model(schema);

  const isViaPlan = formValue.is_via_plan === "true";

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
        // ...formGlobalValues.lots,
        {
          ...(formGlobalValues?.lots?.length ? formGlobalValues.lots[0] : {}),
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
    // onNext();
    if (!formRef.current.check()) {
      toaster.push(
        <Message type="error">
          Пожалуйста, исправьте ошибки перед тем, как перейте на следующий шаг
        </Message>
      );
      document
        .querySelector(".rs-form-group .rs-form-error-message")
        ?.parentNode?.parentNode?.scrollIntoView();
      return;
    }
    nextStep();
  };

  // useEffect(() => {
  //   setFormValue((state) => ({
  //     ...state,
  //     start_acceipting_bids_date: formGlobalValues?.lots[0]?.date_time
  //       ?.start_bids
  //       ? new Date(formGlobalValues?.lots[0]?.date_time?.start_bids)
  //       : new Date(state.start_acceipting_bids_date),
  //     end_acceipting_bids_date: formGlobalValues?.lots[0]?.date_time?.close_bids
  //       ? new Date(formGlobalValues?.lots[0]?.date_time?.close_bids)
  //       : new Date(state.end_acceipting_bids_date),
  //     reviewing_bids_date: formGlobalValues?.lots[0]?.date_time?.review_bids
  //       ? new Date(formGlobalValues?.lots[0]?.date_time?.review_bids)
  //       : new Date(state.reviewing_bids_date),
  //     summing_up_bids_date: formGlobalValues?.lots[0]?.date_time?.summing_up_end
  //       ? new Date(formGlobalValues?.lots[0]?.date_time?.summing_up_end)
  //       : new Date(state.summing_up_bids_date),
  //   }));
  // }, [formGlobalValues.lots]);

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
              label="Дата и время начала рассмотрения заявок"
              format="yyyy-MM-dd HH:mm"
              errorMessage={formError.createDate}
            />
            <Field
              accepter={DatePicker}
              name="summing_up_bids_date"
              label="Дата и время подведения итогов"
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
          <Button onClick={prevStep}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Далее
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step3;
