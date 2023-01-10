import {
  Form,
  Button,
  CheckboxGroup,
  RadioGroup,
  Checkbox,
  Radio,
  Schema,
  Panel,
  Message,
  toaster,
  FlexboxGrid,
  Input,
  Animation,
  SelectPicker,
  Header,
} from "rsuite";
import React, { useContext, useEffect, useState } from "react";
import PurchasePlanTable from "../../../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlans from "../../../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../../../services/api/fetchPurchasePlan";
import fetchSession from "../../../../services/api/fetchSession";
import FormContext from "../../../../context/multiStepForm/context";
import createProcedureViaPurchasePlan from "../../../../services/api/createProcedureViaPurchasePlan";
import Money, { parseCurrency } from "../../../../utils/money";
import { ProcedureFormActionVariants } from "../..";
import sendToast from "../../../../utils/sendToast";
import {
  checkStep1Values,
  dispatchStep1Values,
  initStep1Values,
} from "./helpers";
import { ProcedureMethodVariants, ProcedureSectionVariants } from "../../types";

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

const Step1 = ({ currentStep, setCurrentStep, nextStep, prevStep }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
    currentStepId,
    setCurrentStepId,
  } = useContext(FormContext);

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState(
    initStep1Values({
      globalFormValues: formGlobalValues,
      globalServerValues: formGlobalServerData,
    })
  );

  const planPositionId = formValue.purchase_method_id;
  const procedureTitle = formValue.procedure_title;
  const requirementRNPOption = formValue.options.includes(
    "rnp_requirement_option"
  );
  const smbOption = formValue.options.includes("smb_participant_option");
  const subcontractorOption = formValue.options.includes(
    "subcontractor_option"
  );

  const isViaPlan = formValue.is_via_plan === "true";
  const isEditType =
    formGlobalServerData.actionType === ProcedureFormActionVariants.EDIT;

  const purchasePlansQuery = useQuery(
    ["purchasePlans"],
    async () => {
      const result = await fetchPurchasePlans();
      if (result?.length) {
        setFormValue((state) => ({
          ...state,
          purchase_plan_id: result[0].id,
        }));
      }

      return result;
    },
    {
      refetchInterval: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
    // { enabled: !!isViaPlan }
  );

  const purchasePlanQuery = useQuery(
    ["purchasePlan", formValue.purchase_plan_id],
    async () => await fetchPurchasePlan(formValue.purchase_plan_id),
    {
      enabled: !!(isViaPlan && formValue.purchase_plan_id.trim().length),
      refetchInterval: false,
    }
  );

  // console.log("positionsss", purchasePlanQuery?.data?.positions);

  const currentPurchasePlan = purchasePlansQuery?.data?.find(
    (item) => item.id === formValue.purchase_plan_id
  );

  const [selectedPlanPositions, setSelectedPlanPositions] = useState([]);

  const handleSubmit = async () => {
    if (!formRef.current.check()) {
      sendToast("error", "Пожалуйста заполните необходимые поля формы");
      return;
    }

    const errors = await checkStep1Values(
      formValue,
      currentPurchasePlan,
      selectedPlanPositions
    );
    console.log("errrr", errors);
    if (errors) {
      setFormError((state) => ({ ...state, ...errors }));
      return;
    }
    const selectedPlanPosition = formGlobalServerData?.selectedPlanPosition;
    const {
      globalFormValues: finalGlobalFormValues,
      globalServerValues: finalGlobalServerValues,
    } = await dispatchStep1Values(
      formValue,
      currentPurchasePlan,
      selectedPlanPosition
    );

    setFormGlobalValues((state) => ({ ...state, ...finalGlobalFormValues }));
    setFormGlobalServerData((state) => ({
      ...state,
      ...finalGlobalServerValues,
    }));

    // setFormGlobalValues((state) => ({
    //   ...state,
    //   plan_position_id: isViaPlan ? planPositionId : null,
    //   name: formValue.procedure_title,
    //   platform: formValue.procedure_section,
    //   requirement_not_rnp: requirementRNPOption,
    //   is_for_smb: smbOption,
    //   is_subcontractor_requirement: subcontractorOption,
    // }));

    // setFormGlobalServerData((state) => ({
    //   ...state,
    //   isViaPlan,
    //   purchasePlanId: formValue.purchase_plan_id,
    //   purchasePlanNumber: currentPurchasePlan.registration_number,
    //   planPositionNumber: isViaPlan ? selectedPlanPositions[0].number : null,
    //   procedureMethod: isViaPlan ? 'COMPETITIVE_SELECTION' : formValue.procedure_method
    // }));

    nextStep();
  };

  useEffect(() => {
    const selectedPlanPosition = formGlobalServerData?.selectedPlanPosition;
    if (selectedPlanPosition) {
      setFormValue((state) => ({
        ...state,
        procedure_title: selectedPlanPosition.contract_subject,
        purchase_method_id: selectedPlanPosition.id,
      }));
    }
  }, [formGlobalServerData.selectedPlanPosition]);

  useEffect(() => {
    console.log("selelelel", formValue.purchase_method_id);

    const selectedPlanPosition =
      isViaPlan &&
        formValue.purchase_method_id &&
        purchasePlanQuery.data?.positions?.length
        ? purchasePlanQuery.data?.positions.find(
          (pos) => pos.id === formValue.purchase_method_id
        )
        : formGlobalServerData?.selectedPlanPosition;
    if (!formGlobalServerData?.selectedPlanPosition && isViaPlan) {
      setFormGlobalServerData((state) => ({ ...state, selectedPlanPosition }));
    }
  }, [purchasePlanQuery.data]);

  return (
    <div className="col-md-12">
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
          disabled={isEditType}
        >
          <Radio value={"true"}>
            Заполнение сведений на основе плана закупок
          </Radio>
          <Radio value={"false"}>Заполнение сведений вручную</Radio>
        </Field>

        <Animation.Collapse in={!isViaPlan} timeout={500}>
          <Panel style={{ padding: "0" }}>
            <Field
              name="procedure_section"
              label="Выберите секцию размещения"
              accepter={SelectPicker}
              error={formError.procedure_section}
              data={[
                {
                  value: ProcedureSectionVariants.SECTION_223_FZ,
                  label: "223-ФЗ",
                },
                {
                  value: ProcedureSectionVariants.SECTION_COMMERCIAL_PROCEDURES,
                  label: "Коммерческие процедуры",
                },
              ]}
              placeholder="Выберите"
              disabled={isEditType}
            />
            <Field
              name="procedure_method"
              label="Выберите способ проведения"
              accepter={SelectPicker}
              error={formError.procedure_section}
              data={[
                {
                  value: ProcedureMethodVariants.AUCTION_LOWER,
                  label: "Аукцион",
                },
                {
                  value: ProcedureMethodVariants.AUCTION_DOWN,
                  label: "Редукцион",
                },
                {
                  value: ProcedureMethodVariants.AUCTION,
                  label: "Аукцион на повышение",
                },
                {
                  value: ProcedureMethodVariants.AUCTION_LOWER,
                  label: "Аукцион (заявка в двух частях)",
                },
                {
                  value: ProcedureMethodVariants.COMPETITIVE_SELECTION,
                  label: "Конкурентный отбор",
                },
                {
                  value: ProcedureMethodVariants.REQUEST_OFFERS,
                  label: "Запрос предложений",
                },
                {
                  value: ProcedureMethodVariants.REQUEST_QUOTATIONS,
                  label: "Запрос котировок",
                },
              ]}
              placeholder="Выберите"
              disabled={isEditType}
            />
          </Panel>
        </Animation.Collapse>
        <Animation.Collapse in={isViaPlan}>
          <Panel style={{ padding: "0" }}>
            <Field
              name="purchase_plan_id"
              label="Выберите план закупки"
              accepter={SelectPicker}
              disabled={isEditType}
              error={formError.purchase_plan_id}
              data={
                purchasePlansQuery?.data?.length
                  ? purchasePlansQuery.data.map((plan) => ({
                    value: plan.id,
                    label: `План закупки №${plan.registration_number} (${plan.reporting_year})`,
                  }))
                  : []
              }
              loading={purchasePlansQuery.isLoading}
              placeholder="Выберите"
            />
            <Header>
              {currentPurchasePlan &&
                `План закупки  №${currentPurchasePlan.registration_number} (${currentPurchasePlan.reporting_year})`}
            </Header>
            <PurchasePlanTable
              data={purchasePlanQuery?.data?.positions
                ?.map((position) => ({
                  ...position,
                  maximum_contract_price: position.maximum_contract_price
                    ? new Money(
                      parseInt(
                        position.maximum_contract_price.replaceAll(
                          parseCurrency(position.maximum_contract_price),
                          ""
                        )
                      ),
                      parseCurrency(position.maximum_contract_price)
                    ).localeFormat({ style: "currency" })
                    : "Не предусмотрено",
                  status_localized:
                    position.status === "STATUS_WAIT"
                      ? "Формируется"
                      : position.status === "STATUS_POSTED"
                        ? "Размещена"
                        : position.status === "STATUS_ANNULLED"
                          ? "Аннулирована"
                          : "Редактируется",
                }))
                .reverse()}
              isLoading={purchasePlanQuery?.isLoading}
              selectedItems={selectedPlanPositions}
              setSelectedItems={setSelectedPlanPositions}
              disabled={isEditType}
            />
          </Panel>
        </Animation.Collapse>
        <Field
          name="procedure_title"
          label="Наименование процедуры"
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
          <Button onClick={prevStep}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Сохранить и продолжить
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step1;
