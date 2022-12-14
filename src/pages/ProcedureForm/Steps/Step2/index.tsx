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
import React, { useContext, useEffect, useState } from "react";
import PurchasePlanTable from "../../../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlans from "../../../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../../../services/api/fetchPurchasePlan";
import fetchSession from "../../../../services/api/fetchSession";
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

const Step2 = ({ currentStep, setCurrentStep, nextStep, prevStep }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  console.log("procedureee 2", formGlobalValues);

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    accepting_bids_place: "ON_ETP",
    contract_conclude_type: formGlobalValues?.contract_type || "ON_SITE",
    //TODO:options parser
    options: ["rnp_requirement_option"],
    reduction_ratio_from: "0",
    reduction_ratio_to: "1",
  });

  useEffect(() => {
    setFormValue((state) => ({
      ...state,
      contract_conclude_type: formGlobalValues?.contract_type || "ON_SITE",
    }));
  }, [formGlobalValues.contract_type]);

  const isViaPlan = formGlobalServerData.isViaPlan;

  const sessionQuery = useQuery("session", fetchSession);

  const [selectedPlanPositions, setSelectedPlanPositions] = useState([]);
  const handleSubmit = () => {
    const biddingPerPositionOption = formValue.options.includes(
      "bidding_per_position_option"
    );
    const biddingPerUnitOption = formValue.options.includes(
      "bidding_per_unit_option"
    );
    const reductionRatioOption = formValue.options.includes(
      "reduction_ratio_option"
    );
    const protocolsCountMoreOption = formValue.options.includes(
      "protocols_count_more_option"
    );

    const contractConcludeType = formValue.contract_conclude_type;

    setFormGlobalValues((state) => ({
      ...state,
      // bidding_per_unit: ,
      bidding_per_unit: reductionRatioOption,
      reduction_factor_purchase: reductionRatioOption,
      reduction_factor_purchase_to: parseFloat(formValue.reduction_ratio_to),
      reduction_factor_purchase_from: parseFloat(
        formValue.reduction_ratio_from
      ),
      more_than_one_protocol: protocolsCountMoreOption,
      contract_type: contractConcludeType,
      bid_part: "ONE",
      cause_failed: null,
      is_rebidding: true,
      count_participant_ranked_lower_than_first: null,
      criteria_evaluation: null,
      currency: "RUB",
      currency_rate: 1,
      currency_rate_date: null,
      platform: "SECTION_223_FZ",
      contract_by_any_participant: true,
    }));
    if (isReductionRatioOption) {
      // console.log(
      //   "formvvv",
      //   parseFloat(formValue.reduction_ratio_from),
      //   parseFloat(formValue.reduction_ratio_to)
      // );
      if (
        !formValue.reduction_ratio_from.trim().length ||
        !formValue.reduction_ratio_to.trim().length
      ) {
        return toaster.push(
          <Message type="error">
            Вы не ввели диапазон коэффициента снижения
          </Message>
        );
      }
    }
    nextStep();
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

  const isReductionRatioOption = !!formValue.options.includes(
    "reduction_ratio_option"
  );

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
            name="contract_conclude_type"
            label="Форма заключения контракта"
            accepter={RadioGroup}
            error={formError.contract_conclude_type}
            inline
          >
            <Radio value={"ON_SITE"}>Электронная</Radio>
            <Radio value={"ON_PAPER"}>Бумажная</Radio>
          </Field>
        </Stack>

        <Field
          name="options"
          label="Дополнительные опции"
          accepter={CheckboxGroup}
          error={formError.options}
        >
          <Checkbox value={"bidding_per_position_option"}>
            Попозиционная закупка
          </Checkbox>
          <Checkbox
            // value={"bidding_per_unit_option"}
            value={"reduction_ratio_option"}
            // checked={
            //   !!(
            //     formValue.options.includes("bidding_per_unit_option") ||
            //     formValue.options.includes("reduction_ratio_option")
            //   )
            // }
          >
            Торги за единицу
          </Checkbox>
          <Checkbox value={"reduction_ratio_option"}>
            Коэффициент снижения
          </Checkbox>
          <Stack spacing={10}>
            <Animation.Collapse in={isReductionRatioOption}>
              <div>
                <Field
                  name="reduction_ratio_from"
                  label="Диапазон коэффициента снижения от"
                  accepter={Input}
                  error={formError.reduction_ratio_from}
                />
              </div>
            </Animation.Collapse>

            <Animation.Collapse in={isReductionRatioOption}>
              <div>
                <Field
                  name="reduction_ratio_to"
                  label="Диапазон коэффициента снижения до"
                  accepter={Input}
                  error={formError.reduction_ratio_to}
                />
              </div>
            </Animation.Collapse>
            {/* </div> */}
          </Stack>

          <Checkbox value={"protocols_count_more_option"}>
            Количество публикуемых протоколов, согласно Положению Заказчика,
            более 1
          </Checkbox>
        </Field>
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

export default Step2;
