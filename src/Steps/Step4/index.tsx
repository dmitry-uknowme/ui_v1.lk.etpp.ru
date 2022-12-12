import {
  Form,
  Button,
  Checkbox,
  Schema,
  Panel,
  Input,
  Animation,
  SelectPicker,
  Header,
  Stack,
  InputGroup,
  toaster,
  Message,
} from "rsuite";
import React, { useContext, useEffect, useState } from "react";

import PurchasePlanTable from "../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlans from "../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../services/api/fetchPurchasePlan";
import fetchSession from "../../services/api/fetchSession";
import MultiStepFormContext from "../../context/multiStepForm/context";
import fetchPurchasePlanPosition from "../../services/api/fetchPurchasePlanPosition";
import useDebounce from "../../hooks/useDebounce";
import { Dinero, dinero } from "dinero.js";
import { RUB } from "@dinero.js/currencies";
import LotPositionsTable from "../../components/Table/LotPositionsTable";
import Money, { parseCurrency } from "../../utils/money";

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
  lot_title: StringType().isRequired("Поле обязательно для заполнения"),
});

const Step4 = ({ onNext, onPrevious }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const serverProcedure = formGlobalServerData.procedure;

  console.log("procedureee 4", formGlobalValues);

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    lot_start_price: "",
    lot_title: formGlobalValues?.name || "",
    lot_currency: "RUB",
    nds_type: "NO_NDS",
    provision_bid_is_specified: false,
    provision_bid_type: "WITHOUT_COLLATERAL",
    provision_bid_amount: "",
    provision_bid_percent: "",
    provision_bid_methods: [],
    provision_contract_type: "NOT_SPECIFIED",
    provision_contract_amount: "",
    provision_contract_percent: "",
  });

  const isBidProvisionSpecified =
    formValue.provision_bid_type !== "WITHOUT_COLLATERAL";
  const isContractProvisionSpecified =
    formValue.provision_contract_type !== "NOT_SPECIFIED";
  const isBidProvisionFixed = formValue.provision_bid_type === "FIXED_AMOUNT";
  const isBidProvisionPercent =
    formValue.provision_bid_type === "PERCENTAGE_AMOUNT";
  const isBidProvisionByDocumentation =
    formValue.provision_bid_type === "ACCORDING_DOCUMENTATION";
  const isContractProvisionFromStartPrice =
    formValue.provision_contract_type === "FROM_START_PRICE";

  const planId = formGlobalServerData.purchasePlanId;
  const planPositionId = formGlobalValues.plan_position_id;

  const purchasePlanPositionQuery = useQuery(
    ["purchasePlanPosition"],
    async () => {
      const planPosition = await fetchPurchasePlanPosition({
        planId,
        planPositionId,
      });
      setFormValue((state) => ({
        ...state,
        lot_start_price: new Money(
          planPosition.maximum_contract_price_from_budget.replaceAll(
            parseCurrency(planPosition.maximum_contract_price_from_budget),
            ""
          ),
          "RUB"
          // parseCurrency(planPosition.maximum_contract_price_from_budget)
        ).localeFormat(),
      }));
      return planPosition;
    }
  );

  const sessionQuery = useQuery("session", fetchSession);

  const handleSubmit = () => {
    const bidProvisionAmount = formValue.provision_bid_amount;
    const bidProvisionPercent = formValue.provision_bid_percent;

    const contractProvisionType = formValue.provision_contract_type;
    const contractProvisionAmount = formValue.provision_contract_amount;
    const contractProvisionPercent = formValue.provision_contract_percent;

    setFormGlobalValues((state) => ({
      ...state,
      provision_bid: {
        is_specified: true,
        // is_specified: isBidProvisionSpecified,
        amount: `${"RUB"} ${parseFloat(bidProvisionAmount) * 100}`,
        // percent: parseFloat(bidProvisionPercent),
        // percent: parseFloat(parseFloat(bidProvisionPercent).toFixed(2)),
        // percent: bidProvisionPercent,
        methods: [formValue.provision_bid_type],
        payment_return_deposit: null,
      },
      provision_contract: {
        is_specified: isContractProvisionSpecified,
        type: isContractProvisionSpecified
          ? contractProvisionType
          : "FROM_START_PRICE",
        amount: `${"RUB"} ${parseFloat(contractProvisionAmount) * 100}`,
        // percent: parseFloat(contractProvisionPercent),
        // percent: contractProvisionPercent,
        payment_return_deposit: null,
      },
      original_price: `${"RUB"} ${parseFloat(formValue.lot_start_price) * 100}`,
      lots: [
        {
          ...formGlobalValues.lots[0],
          name: formGlobalValues.name,
          //TODO:da
          starting_price: `${"RUB"} ${
            parseFloat(formValue.lot_start_price) * 100
          }`,
          positions: [],
        },
      ],
    }));
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
    onNext();
  };

  console.log("isss");

  useEffect(() => {
    if (isContractProvisionSpecified) {
      if (
        formValue.lot_start_price &&
        parseFloat(formValue.provision_contract_percent)
      ) {
        const startPrice = new Money(
          Math.round(parseFloat(formValue.lot_start_price) * 100)
        );
        const provisionContractPercent =
          parseFloat(formValue.provision_contract_percent) ?? null;

        console.log("perrccc", provisionContractPercent);
        if (
          !!provisionContractPercent ||
          provisionContractPercent < 5 ||
          provisionContractPercent > 30
        ) {
          setFormError((state) => ({
            ...state,
            provision_contract_percent:
              "Обеспечение исполнения договора должно быть от 5% до 30%",
          }));
          return;
        }

        setFormValue((state) => ({
          ...state,
          provision_contract_amount: new Money(startPrice.amount)
            .multiply(provisionContractPercent)
            .divide(100)
            .localeFormat(),
        }));
      }
    }
  }, [
    isContractProvisionSpecified,
    formValue.provision_contract_type,
    formValue.provision_contract_percent,
    formValue.lot_start_price,
  ]);

  useEffect(() => {
    if (isBidProvisionSpecified) {
      if (isBidProvisionPercent || isBidProvisionByDocumentation) {
        const startPrice = new Money(
          Math.round(parseFloat(formValue.lot_start_price) * 100)
        );
        const provisionBidPercent =
          parseFloat(formValue.provision_bid_percent) ?? null;
        if (
          !provisionBidPercent ||
          provisionBidPercent < 0.5 ||
          provisionBidPercent > 5
        ) {
          setFormError((state) => ({
            ...state,
            provision_bid_percent:
              "Обеспечение заявки должно быть от 0.5% до 5%",
          }));
          return;
        }

        setFormValue((state) => ({
          ...state,
          provision_bid_amount: new Money(startPrice.amount)
            .multiply(provisionBidPercent)
            .divide(100)
            .localeFormat(),
        }));
      }
    }
  }, [
    isBidProvisionSpecified,
    formValue.provision_bid_type,
    formValue.provision_bid_percent,
    formValue.lot_start_price,
  ]);

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
            value={formValue.lot_start_price}
            accepter={Input}
            error={formError.lot_start_price}
          />

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

          {/* <Animation.Collapse in={isBidProvisionSpecified}> */}
          <Stack spacing={10}>
            {/* <div className="col-md-6"> */}
            <Animation.Collapse
              in={isBidProvisionSpecified && !isBidProvisionFixed}
            >
              <div>
                <Field
                  name="provision_bid_percent"
                  label="Размер обеспечения заявки, %"
                  accepter={Input}
                  error={formError.provision_bid_percent}
                />
              </div>
            </Animation.Collapse>
            {/* </div> */}
            {/* <div className="col-md-6"> */}
            <Animation.Collapse in={isBidProvisionSpecified}>
              <div>
                <Field
                  name="provision_bid_amount"
                  label="Размер обеспечения заявки, руб"
                  accepter={Input}
                  value={formValue.provision_bid_amount}
                  disabled={isBidProvisionPercent}
                />
              </div>
            </Animation.Collapse>
            {/* </div> */}
          </Stack>
          {/* </Animation.Collapse> */}
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
            <Animation.Collapse in={isContractProvisionSpecified}>
              <div>
                <Field
                  name="provision_contract_percent"
                  label="Размер обеспечения исполнения договора, %"
                  accepter={Input}
                  error={formError.provision_contract_percent}
                />
              </div>
            </Animation.Collapse>
            <Animation.Collapse in={isContractProvisionFromStartPrice}>
              <div>
                <Field
                  name="provision_contract_amount"
                  label="Размер обеспечения исполнения договора, руб"
                  accepter={Input}
                  value={formValue.provision_contract_amount}
                />
              </div>
            </Animation.Collapse>
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
          <Header>Перечень товаров, работ, услуг</Header>
          <LotPositionsTable
            data={
              purchasePlanPositionQuery.data?.positions?.length
                ? purchasePlanPositionQuery.data.positions.map((position) => ({
                    ...position,
                    okpd_field: `${position.okpd_code}. ${position.okpd_name}`,
                    okved_field: `${position.okved_code}. ${position.okved_name}`,
                    qty: `${position.qty}, ${position.unit_name}`,
                    region: "Респ. Башкортостан",
                  }))
                : []
            }
            isLoading={purchasePlanPositionQuery.isLoading}
          />
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
