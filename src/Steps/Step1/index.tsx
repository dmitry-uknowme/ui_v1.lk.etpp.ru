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

const Step1 = ({ onNext, onPrevious }) => {
  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    is_via_plan: "false",
    purchase_plan_id: "",
    procedure_title: "",
    procedure_section: "SECTION_FZ_223",
    procedure_method: "AUCTION",
    options: ["rnp_requirement_option"],
  });

  const isViaPlan = formValue.is_via_plan === "true";

  const purchasePlansQuery = useQuery(
    ["purchasePlans", isViaPlan],
    async () => {
      if (isViaPlan) {
        const result = await fetchPurchasePlans();
        setFormValue((state) => ({ ...state, purchase_plan_id: result[0].id }));
        return result;
      }
    }
  );

  const sessionQuery = useQuery("session", fetchSession);

  const purchasePlanQuery = useQuery(
    ["purchasePlan", formValue.purchase_plan_id],
    async () =>
      isViaPlan &&
      formValue.purchase_plan_id.trim().length &&
      (await fetchPurchasePlan(formValue.purchase_plan_id))
  );

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
                { value: "SECTION_FZ_223", label: "223-ФЗ" },
                {
                  value: "SECTION_COMMERCIAL_PROCEDURES",
                  label: "Коммерческие процедуры",
                },
              ]}
              placeholder="Выберите"
            />
            <Field
              name="procedure_method"
              label="Выберите способ проведения"
              accepter={SelectPicker}
              error={formError.procedure_section}
              data={[
                { value: "AUCTION", label: "Аукцион" },
                { value: "COMPETITIVE_SELECTION", label: "Конкурентный отбор" },
              ]}
              placeholder="Выберите"
            />
          </Panel>
        </Animation.Collapse>
        <Animation.Collapse in={isViaPlan}>
          <Panel style={{ padding: "0" }}>
            <Field
              name="purchase_plan_id"
              label="Выберите план закупки"
              accepter={SelectPicker}
              error={formError.purchase_plan_id}
              data={
                purchasePlansQuery?.data?.length
                  ? purchasePlansQuery.data.map((plan) => ({
                      value: plan.id,
                      label: `План закупки (${plan.reporting_year})`,
                    }))
                  : []
              }
              loading={purchasePlansQuery.isLoading}
              placeholder="Выберите"
            />
            <Header>
              {purchasePlansQuery?.data?.length &&
                "План закупки (" +
                  purchasePlansQuery.data.find(
                    (item) => item.id === formValue.purchase_plan_id
                  )?.reporting_year +
                  ")"}
            </Header>
            <PurchasePlanTable
              data={purchasePlanQuery?.data?.positions}
              isLoading={purchasePlanQuery?.isLoading}
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
          <Button onClick={onPrevious}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Далее
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step1;
