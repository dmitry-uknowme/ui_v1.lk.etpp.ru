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
      {message && <Form.HelpText></Form.HelpText>}
    </Form.Group>
  );
});

const { ArrayType, NumberType, StringType } = Schema.Types;
const model = Schema.Model({
  is_via_plan: StringType().isRequired("Поле обязательно для заполнения"),
  procedure_title: StringType().isRequired("Поле обязательно для заполнения"),
});

const Step4 = ({ onNext, onPrevious }) => {
  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    lot_start_price: "",
    lot_title: "",
    lot_currency: "RUB",
    nds_type: "NO_NDS",
    provision_bid_type: "WITHOUT_COLLATERAL",
    provision_contract_type: "NOT_SPECIFIED",
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
  const isBidProvisionSpecified =
    formValue.provision_bid_type !== "WITHOUT_COLLATERAL";

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
    <div className="col-md-9">
      <Form
        ref={formRef}
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        model={model}
      >
        <Field
          name="lot_title"
          label="Наименование предмета договора (лота)"
          accepter={Input}
          error={formError.lot_title}
          // as="textarea"
          rows={3}
        />
        <Stack wrap spacing={30}>
          <Field
            name="lot_start_price"
            label="Начальная (максимальная) цена"
            accepter={InputGroup}
            error={formError.lot_start_price}
          >
            <Input />

            {/* <Input /> */}
            <InputGroup.Addon>.00</InputGroup.Addon>
          </Field>
          <Field
            name="lot_currency"
            label="Валюта"
            accepter={SelectPicker}
            error={formError.lot_currency}
            data={[
              { value: "RUB", label: "Российский рубль" },
              { value: "EUR", label: "Евро" },
              { value: "USD", label: "Доллар США" },
            ]}
          />
        </Stack>
        <Field
          name="nds_type"
          label="Выбор НДС"
          accepter={SelectPicker}
          error={formError.nds_type}
          data={[
            { value: "NO_NDS", label: "Без НДС" },
            { value: "NDS_10", label: "10%" },
            { value: "NDS_18", label: "18%" },
            { value: "NDS_20", label: "20%" },
          ]}
        />
        <Panel header="Обеспечение заявки">
          <Field
            name="provision_bid_type"
            label="Вид обеспечения заявки"
            placeholder="Выберите"
            accepter={SelectPicker}
            error={formError.provision_bid_type}
            data={[
              { value: "WITHOUT_COLLATERAL", label: "Без обеспечения" },
              {
                value: "PERCENTAGE_AMOUNT",
                label:
                  "Процент от НМЦ (с внесением д/с на эл. площадку или банковская гарантия на эл. площадку)",
              },
              {
                value: "FIXED_AMOUNT",
                label:
                  "Фиксированная сумма (с внесением д/с на эл. площадку или банковская гарантия)",
              },
              {
                value: "ACCORDING_DOCUMENTATION",
                label: "В соответствии с документацией",
              },
            ]}
          >
            <Checkbox value={"ON"}>Без обеспечения</Checkbox>
          </Field>

          <Animation.Collapse in={isBidProvisionSpecified}>
            <Stack spacing={10}>
              {/* <div className="col-md-6"> */}
              <Field
                name="provision_bid_percent"
                label="Размер обеспечения заявки, %"
                accepter={Input}
              />
              {/* </div> */}
              {/* <div className="col-md-6"> */}
              <Field
                name="provision_bid_amount"
                label="Размер обеспечения заявки, руб"
                accepter={Input}
              />
              {/* </div> */}
            </Stack>
          </Animation.Collapse>
        </Panel>

        <Panel header="Обеспечение исполнения договора">
          {/* <Field
            name="provision_contract_option"
            accepter={CheckboxGroup}
            error={formError.provision_contract_option}
          >
            <Checkbox value={"ON"}>Установлено</Checkbox>
          </Field> */}
          <Field
            name="provision_contract_type"
            label="Тип обеспечения исполнения договора"
            accepter={SelectPicker}
            error={formError.provision_contract_type}
            data={[
              { value: "NOT_SPECIFIED", label: "Не установлено" },
              { value: "FROM_START_PRICE", label: "От начальной цены лота" },
              { value: "FROM_CONTRACT_PRICE", label: "От цены договора" },
            ]}
            placeholder="Выберите"
          />
          <Stack spacing={10}>
            <Field
              name="provision_contract_percent"
              label="Размер обеспечения исполнения договора, %"
              accepter={Input}
            />
            <Field
              name="provision_contract_amount"
              label="Размер обеспечения исполнения договора, руб"
              accepter={Input}
            />
          </Stack>
          {/* <Field
            label="Размер обеспечения исполнения договора от"
            accepter={RadioGroup}
            error={formError.provision_contract_type}
            inline
            name="provision_contract_type"
          >
            <Radio value={"FROM_START_PRICE"}>От начальной цены лота</Radio>
            <Radio value={"FROM_CONTRACT_PRICE"}>От цены договора</Radio>
          </Field> */}
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

export default Step4;
