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
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import sendToast from "../../../../utils/sendToast";

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

  const isProcedureCompetitiveSelection = formGlobalServerData?.procedureMethod === 'COMPETITIVE_SELECTION'
  const isProcedureEasy = formGlobalServerData?.procedureMethod === 'COMPETITIVE_SELECTION' || formGlobalServerData?.procedureMethod === 'REQUEST_QUOTATIONS' || formGlobalServerData?.procedureMethod === 'REQUEST_OFFERS'

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    accepting_bids_place: "ON_ETP",
    contract_conclude_type: formGlobalValues?.contract_type || "ON_SITE",
    options: [
      formGlobalValues?.bidding_per_unit && "reduction_ratio_option",
      formGlobalValues?.bidding_per_position_option &&
      "bidding_per_position_option",
      formGlobalValues?.more_than_one_protocol && "protocols_count_more_option",
      formGlobalValues?.position_purchase && "bidding_per_position_option",
      "rnp_requirement_option",
    ],
    count_participant_ranked_lower_than_first: "",
    reduction_ratio_from:
      formGlobalValues?.reduction_factor_purchase_from?.toString() || "0",
    reduction_ratio_to:
      formGlobalValues?.reduction_factor_purchase_to?.toString() || "1",
  });
  useEffect(() => {
    setFormValue((state) => ({
      ...state,
      contract_conclude_type: formGlobalValues?.contract_type || "ON_SITE",
    }));
  }, [formGlobalValues.contract_type]);

  const isViaPlan = formGlobalServerData.isViaPlan;

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
    const contractByAnyParticipantOption = formValue.options.includes(
      "contract_by_any_participant_option"
    );

    const contractConcludeType = formValue.contract_conclude_type;

    setFormGlobalValues((state) => ({
      ...state,
      position_purchase: biddingPerPositionOption,
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
      is_rebidding: isProcedureCompetitiveSelection ? true : formValue.options.includes('rebidding_option'),
      count_participant_ranked_lower_than_first: 1,
      criteria_evaluation: null,
      currency: "RUB",
      currency_rate: 1,
      currency_rate_date: null,
      contract_by_any_participant: contractByAnyParticipantOption,
    }));
    setFormGlobalServerData((state) => ({
      ...state,
      options: formValue.options,
    }));
    if (isReductionRatioOption) {
      if (
        !formValue.reduction_ratio_from.trim().length ||
        !formValue.reduction_ratio_to.trim().length
      ) {
        sendToast("error", "Вы не ввели диапазон коэффициента снижения");
        // return toaster.push(
        //   <Message type="error">
        //     Вы не ввели диапазон коэффициента снижения
        //   </Message>
        // );
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

  useEffect(() => {
    if (isReductionRatioOption) {
      setFormValue((state) => ({
        ...state,
        options: [
          ...state.options.filter(
            (opt) => opt === "bidding_per_position_option"
          ),
        ],
      }));
    }
  }, [formValue.options]);

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
          {isProcedureEasy ? (<Checkbox
            value={"rebidding_option"}
          >
            Переторжка предусмотрена
          </Checkbox>) : null}
          {isProcedureCompetitiveSelection ? (<>
            <Checkbox
              value={"bidding_per_position_option"}
              disabled={isReductionRatioOption}
            >
              Попозиционная закупка
            </Checkbox>
            <Checkbox
              value={"reduction_ratio_option"}
            >
              Торги за единицу
            </Checkbox> <Checkbox value={"reduction_ratio_option"}>
              Коэффициент снижения
            </Checkbox></>) : null}

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
          <Checkbox
            value={"contract_by_any_participant_option"}
          >
            Заключение договора возможно с любым из допущенных участников

          </Checkbox>
          <Animation.Collapse in={contractByAnyParticipantOption}>
            <Field
              name="count_participant_ranked_lower_than_first"
              label="Количество участников, занявших места ниже первого, с которыми возможно заключение договора по результатам процедуры"
              accepter={InputNumber}
              scrollable={false}
              error={formError.count_participant_ranked_lower_than_first}
            />
            <div>

            </div>
          </Animation.Collapse>
        </Field>
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

export default Step2;
