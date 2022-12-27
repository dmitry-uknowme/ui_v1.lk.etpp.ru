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
import sendToast from "../../../../utils/sendToast";
import { checkStep3Values, dispatchStep3Values, initStep3Values } from "./helpers";

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
  const [formValue, setFormValue] = React.useState(initStep3Values({ globalFormValues: formGlobalValues, globalServerValues: formGlobalServerData }));

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

  const handleSubmit = () => {
    console.log('errrrrr', formError)
    if (!formRef.current.check()) {

      sendToast("error", "Пожалуйста заполните необходимые поля формы");
      return;
    }

    const errors = checkStep3Values(formValue)
    // console.log('errrr', errors)
    if (errors) {
      setFormError(state => ({ ...state, ...errors }))
      return
    }

    const { globalFormValues: finalGlobalFormValues, globalServerValues: finalGlobalServerValues } = dispatchStep3Values(formValue)

    setFormGlobalValues(state => ({ ...state, ...finalGlobalFormValues }))
    setFormGlobalServerData(state => ({ ...state, ...finalGlobalServerValues }))

    nextStep()
    //   document
    //     .querySelector(".rs-form-group .rs-form-error-message")
    //     ?.parentNode?.parentNode?.scrollIntoView();
    //   document
    //     .querySelector(".rs-form-error-message-inner")
    //     ?.parentNode?.parentNode?.parentNode?.parentNode?.scrollIntoView();
    //   return;
  }
  // nextStep();



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
            onChange={(value) =>
              setFormValue((state) => ({ ...state, bidding_process: value }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Порядок рассмотрения заявок"
            name="order_review_and_summing_up"
            accepter={Input}
            value={formValue.order_review_and_summing_up}
            onChange={(value) =>
              setFormValue((state) => ({
                ...state,
                order_review_and_summing_up: value,
              }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Место рассмотрения заявок/подведения итогов"
            name="place_review_and_summing_up"
            accepter={Input}
            value={formValue.place_review_and_summing_up}
            onChange={(value) =>
              setFormValue((state) => ({
                ...state,
                place_review_and_summing_up: value,
              }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Порядок подведения итогов"
            name="procedure_process"
            accepter={Input}
            value={formValue.procedure_process}
            onChange={(value) =>
              setFormValue((state) => ({ ...state, procedure_process: value }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Место проведения торгов"
            name="info_trading_venue"
            accepter={Input}
            value={formValue.info_trading_venue}
            onChange={(value) =>
              setFormValue((state) => ({ ...state, info_trading_venue: value }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Сведения о порядке предоставления разъяснений на документацию"
            name="providing_documentation_explanation"
            accepter={Input}
            value={formValue.providing_documentation_explanation}
            onChange={(value) =>
              setFormValue((state) => ({
                ...state,
                providing_documentation_explanation: value,
              }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Требования к участникам"
            name="requirements_participant"
            accepter={Input}
            value={formValue.requirements_participant}
            onChange={(value) =>
              setFormValue((state) => ({
                ...state,
                requirements_participant: value,
              }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Срок, место и порядок предоставление документации о закупке"
            name="provision_procurement_documentation"
            accepter={Input}
            value={formValue.provision_procurement_documentation}
            onChange={(value) =>
              setFormValue((state) => ({
                ...state,
                provision_procurement_documentation: value,
              }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          <Field
            label="Иные сведения определяемые заказчиком"
            name="other_info_by_customer"
            accepter={Input}
            value={formValue.other_info_by_customer}
            onChange={(value) =>
              setFormValue((state) => ({
                ...state,
                other_info_by_customer: value,
              }))
            }
            as="textarea"
            style={{ width: "100%" }}
          />
          {/* </Stack> */}
        </Panel>

        <Form.Group>
          <Button onClick={prevStep}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Сохранить и продолжить
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step3;
