import {
  Form,
  Button,
  CheckboxGroup,
  RadioGroup,
  Checkbox,
  Radio,
  Schema,
  Input,
  Animation,
  Stack,
  InputNumber,
  Whisper,
  Tooltip,
} from "rsuite";
import InfoRoundIcon from "@rsuite/icons/InfoRound";
import React, { useContext, useEffect, useState } from "react";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import sendToast from "../../../../utils/sendToast";
import { checkStep2Values, dispatchStep2Values, initStep2Values } from "./helpers";

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
  // is_via_plan: StringType().isRequired("Поле обязательно для заполнения"),
  // procedure_title: StringType().isRequired("Поле обязательно для заполнения"),
});

const Step2 = ({ currentStep, setCurrentStep, nextStep, prevStep }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const isProcedureCompetitiveSelection =
    formGlobalServerData?.procedureMethod === "COMPETITIVE_SELECTION";
  const isProcedureEasy =
    formGlobalServerData?.procedureMethod === "REQUEST_QUOTATIONS" ||
    formGlobalServerData?.procedureMethod === "REQUEST_OFFERS";

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState(initStep2Values({ globalFormValues: formGlobalValues, globalServerValues: formGlobalServerData }))


  const isViaPlan = formGlobalServerData.isViaPlan;
  const contractByAnyParticipantOption = formValue.options.includes(
    "contract_by_any_participant_option"
  );

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

  const handleSubmit = () => {
    if (!formRef.current.check()) {
      sendToast("error", "Пожалуйста заполните необходимые поля формы");
      return;
    }

    const errors = checkStep2Values(formValue)
    if (errors) {
      setFormError(state => ({ ...state, ...errors }))
      return
    }

    const { globalFormValues: finalGlobalFormValues, globalServerValues: finalGlobalServerValues } = dispatchStep2Values(formValue)

    setFormGlobalValues(state => ({ ...state, ...finalGlobalFormValues }))
    setFormGlobalServerData(state => ({ ...state, ...finalGlobalServerValues }))

    nextStep();

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
        <Stack wrap spacing={50}>
          <Field
            name="bid_part_type"
            label="Процедура состоит из"
            accepter={RadioGroup}
            error={formError.bid_part_type}
            inline
          >
            <Radio value={"ONE"}>Одной части</Radio>
            <Radio value={"SECOND"}>Двух частей</Radio>
          </Field>
        </Stack>

        <Field
          name="options"
          label="Дополнительные опции"
          accepter={CheckboxGroup}
          error={formError.options}
        >
          {isProcedureEasy ? (
            <Checkbox value={"rebidding_option"}>
              Переторжка предусмотрена
            </Checkbox>
          ) : null}
          {isProcedureCompetitiveSelection ? (
            <>
              {/* <Checkbox
                value={"bidding_per_position_option"}
                disabled={reducti}
              >
                Попозиционная закупка
              </Checkbox> */}
              <Checkbox value={"reduction_ratio_option"}>
                Торги за единицу
              </Checkbox>
              <Checkbox value={"reduction_ratio_option"}>
                Коэффициент снижения
              </Checkbox>
            </>
          ) : null}

          <Stack spacing={10}>
            <Animation.Collapse in={reductionRatioOption}>
              <div>
                <Field
                  name="reduction_ratio_from"
                  label="Диапазон коэффициента снижения от"
                  accepter={Input}
                  error={formError.reduction_ratio_from}
                />
              </div>
            </Animation.Collapse>

            <Animation.Collapse in={reductionRatioOption}>
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
          <Checkbox value={"contract_by_any_participant_option"}>
            Заключение договора возможно с любым из допущенных участников
            <Whisper
              speaker={
                <Tooltip style={{ width: 300 }}>
                  Заключение договора будет возможно с любым из допущенных
                  участников. Блокирование обеспечения заявок сохранится у всех
                  допущенных участников после публикации итогового (последнего)
                  протокола закупки до момента заключения договора.
                </Tooltip>
              }
              placement="autoHorizontalEnd"
            >
              <InfoRoundIcon color="#3498ff" style={{ marginLeft: "0.5rem" }} />
            </Whisper>
          </Checkbox>
          <Animation.Collapse in={!contractByAnyParticipantOption}>
            <div>
              <Field
                name="count_participant_ranked_lower_than_first"
                label={
                  <>
                    Количество участников, занявших места ниже первого, с
                    которыми возможно заключение договора по результатам
                    процедуры
                    <Whisper
                      speaker={
                        <Tooltip style={{ width: 300 }}>
                          Количество участников, занявших места ниже первого, с
                          которыми возможно заключение договора по результатам
                          процедуры, блокирование обеспечения заявок на участие
                          которых сохраняется после публикации итогового
                          (последнего) протокола закупки до момента заключения
                          договора с одним из участников или отказа от
                          заключения договора (с признанием или без признания
                          участника уклонившимся от заключения договора).
                        </Tooltip>
                      }
                      placement="autoHorizontalEnd"
                    >
                      <InfoRoundIcon
                        color="#3498ff"
                        style={{ marginLeft: "0.5rem" }}
                      />
                    </Whisper>
                  </>
                }
                accepter={InputNumber}
                scrollable={false}
                error={formError.count_participant_ranked_lower_than_first}
              />
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
