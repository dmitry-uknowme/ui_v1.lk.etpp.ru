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
  InputNumber,
} from "rsuite";
import React, { useContext, useEffect, useState } from "react";
import currency from "currency.js";

import PurchasePlanTable from "../../../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlans from "../../../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../../../services/api/fetchPurchasePlan";
import fetchSession from "../../../../services/api/fetchSession";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import fetchPurchasePlanPosition from "../../../../services/api/fetchPurchasePlanPosition";
import useDebounce from "../../../../hooks/useDebounce";
import { RUB } from "@dinero.js/currencies";
import LotPositionsTable from "../../../../components/Table/LotPositionsTable";
import Money, { parseCurrency, parseDBMoney } from "../../../../utils/money";
import { parseDBAmount } from "../../../../utils/newMoney";

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
  lot_title: StringType().isRequired("Поле обязательно для заполнения"),
});

const Step4 = ({ currentStep, setCurrentStep, nextStep, prevStep }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);
  const [editedPositions, setEditedPositions] = useState();
  const [isBtnLoader, setBtnLoader] = useState<boolean>(false);
  const isBiddingPerUnitOption = !!formGlobalValues?.bidding_per_unit;
  const serverProcedure = formGlobalServerData.procedure;
  const [positionsTableData, setPositionsTableData] = useState([])
  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    lot_start_price: formGlobalValues?.original_price ? currency(parseDBAmount(formGlobalValues.original_price) / 100).toString() : "",
    lot_title:
      formGlobalValues?.name || formGlobalValues?.lots?.length
        ? formGlobalValues.lots[0].name : "",
    lot_currency: "RUB",
    nds_type: formGlobalValues?.nds_type || "NO_NDS",
    provision_bid_type: formGlobalValues?.provision_bid?.methods?.length
      ? formGlobalValues?.provision_bid?.methods[0]
      : "WITHOUT_COLLATERAL",
    provision_bid_amount: formGlobalValues?.provision_bid?.amount
      ? currency(
        parseDBAmount(formGlobalValues.provision_bid.amount) / 100
      ).toString()
      : "",
    provision_bid_percent: formGlobalValues?.provision_bid?.amount && formGlobalValues?.original_price ? currency(parseDBAmount(formGlobalValues?.provision_bid?.amount) / 100).divide(currency(parseDBAmount(formGlobalValues.original_price)) / 100).multiply(100) : "",
    // formGlobalValues?.provision_bid?.percent?.toString() || "",
    provision_bid_methods: formGlobalValues?.provision_bid?.methods || [],
    provision_contract_type:
      formGlobalValues?.provision_contract?.is_specified === false
        ? "NOT_SPECIFIED"
        : formGlobalValues?.provision_contract?.type || "NOT_SPECIFIED",
    provision_contract_amount: formGlobalValues?.provision_contract?.amount
      ? currency(
        parseDBAmount(formGlobalValues.provision_contract.amount) / 100
      ).toString()
      : "",
    provision_contract_percent: formGlobalValues?.provision_contract?.percent ? formGlobalValues?.provision_contract?.percent : formGlobalValues?.provision_contract?.amount && formGlobalValues?.original_price ? currency(parseDBAmount(formGlobalValues?.provision_contract?.amount) / 100).divide(currency(parseDBAmount(formGlobalValues.original_price)) / 100).multiply(100) : "",
    lot_unit_start_price: formGlobalValues?.bidding_per_unit_amount
      ? currency(
        parseDBAmount(formGlobalValues.bidding_per_unit_amount) / 100
      ).toString()
      : "",
    provision_bid_payment_return_deposit:
      formGlobalValues?.provision_bid?.payment_return_deposit ||
      "В соответствии с закупочной документацией",
    provision_contract_payment_return_deposit:
      formGlobalValues?.provision_contract?.payment_return_deposit ||
      "В соответствии с закупочной документацией",
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
  const isContractProvisionFromContractPrice =
    formValue.provision_contract_type === "FROM_CONTRACT_PRICE";

  const planId = formGlobalServerData?.purchasePlanId;
  const planPositionId = formGlobalValues?.plan_position_id;

  const purchasePlanPositionQuery = useQuery(
    ["purchasePlanPosition"],
    async () => {
      const planPosition = await fetchPurchasePlanPosition({
        planId,
        planPositionId,
      });
      if (planPosition?.positions?.length) {
        setPositionsTableData(planPosition.positions)
      }
      if (!formValue.lot_start_price) {
        setFormValue((state) => ({
          ...state,
          lot_start_price: new Money(
            planPosition.maximum_contract_price_from_budget.replaceAll(
              parseCurrency(planPosition.maximum_contract_price_from_budget),
              ""
            ),
            "RUB"
          ).localeFormat(),
        }));
      }
      return planPosition;
    },
    {
      refetchInterval: false, refetchOnMount: false, refetchIntervalInBackground: false, refetchOnWindowFocus: false
    }
  );

  const biddingPerPositionOption = formGlobalServerData?.options?.includes("bidding_per_position_option") ?? false



  const handleSubmit = () => {
    // setBtnLoader(true);
    const bidProvisionAmount = formValue.provision_bid_amount;
    const bidProvisionPercent = formValue.provision_bid_percent;

    const contractProvisionType = formValue.provision_contract_type;
    const contractProvisionAmount = formValue.provision_contract_amount;
    const contractProvisionPercent = formValue.provision_contract_percent;
    if (biddingPerPositionOption) {
      const defaultPlanPositions = purchasePlanPositionQuery?.data?.positions
      if (defaultPlanPositions.length !== formGlobalValues?.lots[0]?.positions?.length) {
        toaster.push(<Message type='error'>Не всем позициям лота проставлена цена</Message>)
        return
      }
    }
    if (isBiddingPerUnitOption) {
      if (!parseFloat(formValue.lot_unit_start_price)) {
        setFormError((state) => ({
          ...state,
          lot_unit_start_price: "Поле обязательно для заполнения",
        }));
        setBtnLoader(false);
        return;
      }
    }

    setFormGlobalValues((state) => ({
      ...state,
      name: formValue.lot_title,
      bidding_per_unit_amount: isBiddingPerUnitOption
        ? `${"RUB"} ${currency(parseFloat(formValue.lot_unit_start_price)).intValue
        }`
        : null,
      provision_bid: {
        is_specified: isBidProvisionSpecified,
        // is_specified: isBidProvisionSpecified,
        amount: parseFloat(bidProvisionAmount)
          ? `${"RUB"} ${currency(parseFloat(bidProvisionAmount)).intValue}`
          : "RUB 0",
        // percent: parseFloat(bidProvisionPercent),
        // percent: parseFloat(parseFloat(bidProvisionPercent).toFixed(2)),
        // percent: bidProvisionPercent,
        methods: [formValue.provision_bid_type],
        payment_return_deposit: formValue.provision_bid_payment_return_deposit,
      },
      provision_contract: {
        is_specified: isContractProvisionSpecified,
        type: isContractProvisionSpecified
          ? contractProvisionType
          : "FROM_START_PRICE",
        amount:
          isContractProvisionSpecified && isContractProvisionFromStartPrice
            ? parseFloat(contractProvisionAmount)
              ? `${"RUB"} ${currency(parseFloat(contractProvisionAmount)).intValue
              }`
              : "RUB 0"
            : null,
        percent:
          isContractProvisionSpecified && isContractProvisionFromContractPrice
            ? parseFloat(contractProvisionPercent)
            : null,
        // percent: contractProvisionPercent,
        payment_return_deposit:
          formValue.provision_contract_payment_return_deposit,
      },
      original_price: `${"RUB"} ${currency(parseFloat(formValue.lot_start_price)).intValue
        }`,
      lots: [
        {
          ...(formGlobalValues?.lots?.length ? formGlobalValues?.lots[0] : {}),
          name: formValue.lot_title,
          starting_price: `${"RUB"} ${currency(parseFloat(formValue.lot_start_price)).intValue
            }`,
          positions: isBiddingPerUnitOption ? [] : [],
          nds_type: formValue.nds_type,
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
      document.querySelector(".rs-form-error-message-inner")?.scrollIntoView();
      return;
    }
    setBtnLoader(false);
    nextStep();
  };

  useEffect(() => {
    if (isContractProvisionSpecified) {
      const startPrice = currency(parseFloat(formValue.lot_start_price));
      const provisionContractPercent =
        parseFloat(formValue.provision_contract_percent) ?? null;
      const provisionContractDocs =
        formValue.provision_contract_payment_return_deposit;
      if (!provisionContractDocs) {
        setFormError((state) => ({
          ...state,
          provision_contract_payment_return_deposit:
            "Поле обязательно для заполнения",
        }));
      }
      if (!parseFloat(formValue.lot_start_price)) {
        setFormError((state) => ({
          ...state,
          provision_contract_amount: "Введите НМЦ лота",
        }));
        setFormValue((state) => ({ ...state, provision_contract_amount: "" }));
        return;
      }
      if (!provisionContractPercent) {
        return;
      }
      if (
        !provisionContractPercent ||
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
        provision_contract_amount: startPrice
          .multiply(provisionContractPercent)
          .divide(100)
          .toString(),
      }));
      // }
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
        const startPrice = currency(parseFloat(formValue.lot_start_price));
        const provisionBidPercent =
          parseFloat(formValue.provision_bid_percent) ?? null;
        const provisionBidDocs = formValue.provision_bid_payment_return_deposit;
        if (!provisionBidDocs) {
          setFormError((state) => ({
            ...state,
            provision_bid_payment_return_deposit:
              "Поле обязательно для заполнения",
          }));
        }

        if (!parseFloat(formValue.lot_start_price)) {
          setFormError((state) => ({
            ...state,
            provision_bid_amount: "Введите НМЦ лота",
          }));
          setFormValue((state) => ({
            ...state,
            provision_bid_amount: "",
          }));
          return;
        }

        if (!provisionBidPercent) {
          return;
        }

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
          provision_bid_amount: startPrice
            .multiply(provisionBidPercent)
            .divide(100)
            .toString(),
        }));
      }
    }
  }, [
    isBidProvisionSpecified,
    formValue.provision_bid_type,
    formValue.provision_bid_percent,
    formValue.lot_start_price,
  ]);

  useEffect(() => {
    if (isBiddingPerUnitOption) {
      if (!parseFloat(formValue.lot_unit_start_price)) {
        setFormError((state) => ({
          ...state,
          lot_unit_start_price: "Поле обязательно для заполнения",
        }));
      }
    }
  }, [formValue.lot_unit_start_price]);

  useEffect(() => {
    if (formGlobalValues?.name) {
      setFormValue(state => ({ ...state, lot_title: formGlobalValues.name }))
    }
  }, [formGlobalValues.name])

  // useEffect(() => {
  //   setFormValue((state) => ({
  //     ...state,
  //     lot_start_price: formGlobalValues?.original_price
  //       ? parseDBAmount(formGlobalValues.original_price).toString()
  //       : state.lot_start_price,
  //     provision_bid_amount: formGlobalValues?.provision_bid?.amount
  //       ? parseDBAmount(formGlobalValues.provision_bid.amount).toString()
  //       : state.provision_bid_amount,
  //     provision_bid_is_specified: formGlobalValues?.provision_bid?.is_specified
  //       ? formGlobalValues.provision_bid.is_specified
  //       : state.provision_bid_is_specified,
  //     provision_contract_amount: formGlobalValues?.provision_contract?.amount
  //       ? parseDBAmount(formGlobalValues.provision_contract.amount).toString()
  //       : state.provision_contract_amount,
  //     provision_contract_type: formGlobalValues?.provision_contract?.type
  //       ? formGlobalValues.provision_contract.type
  //       : state.provision_contract_type,
  //     // provision_bid_is_specified: formGlobalValues.provision_bid.is_specified,
  //   }));
  // }, [
  //   formGlobalValues.provision_bid,
  //   formGlobalValues.provision_contract,
  //   formGlobalValues.original_price,
  // ]);


  console.log('table dataaa', positionsTableData)
  useEffect(() => {
    if (!Object.keys(formError).length) {
      setBtnLoader(false);
    }
  }, [formError]);
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
          {isBiddingPerUnitOption ? (
            <Field
              name="lot_unit_start_price"
              label="Начальная (максимальная) цена за единицу"
              accepter={Input}
              error={formError.lot_unit_start_price}
            />
          ) : null}
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
            { value: "FIX_10", label: "10%" },
            { value: "FIX_18", label: "18%" },
            { value: "FIX_20", label: "20%" },
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
                  accepter={InputNumber}
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
                  accepter={InputNumber}
                  value={formValue.provision_bid_amount}
                  disabled={isBidProvisionPercent}
                />
              </div>
            </Animation.Collapse>
            {/* </div> */}
          </Stack>
          <Animation.Collapse in={isBidProvisionSpecified}>
            <div>
              <Field
                label="Срок и порядок внесения обеспечения заявки"
                name="provision_bid_payment_return_deposit"
                accepter={Input}
                value={formValue.provision_bid_payment_return_deposit}
                onChange={(value) => setFormValue(state => ({ ...state, provision_bid_payment_return_deposit: value }))}
                as="textarea"
                style={{ width: "100%" }}
              />
            </div>
          </Animation.Collapse>
          {/* </Animation.Collapse> */}
        </Panel>

        <Panel header="Обеспечение исполнения договора">
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
                  accepter={InputNumber}
                  error={formError.provision_contract_percent}
                />
              </div>
            </Animation.Collapse>
            <Animation.Collapse in={isContractProvisionFromStartPrice}>
              <div>
                <Field
                  name="provision_contract_amount"
                  label="Размер обеспечения исполнения договора, руб"
                  accepter={InputNumber}
                  error={formError.provision_contract_amount}
                  disabled={isContractProvisionFromStartPrice}
                />
              </div>
            </Animation.Collapse>
          </Stack>
          <Animation.Collapse in={isContractProvisionSpecified}>
            <div>
              <Field
                label="Срок и порядок внесения обеспечения исполнения договора"
                name="provision_contract_payment_return_deposit"
                accepter={Input}
                value={formValue.provision_contract_payment_return_deposit}
                error={formError.provision_contract_payment_return_deposit}
                onChange={(value) => setFormValue(state => ({ ...state, provision_contract_payment_return_deposit: value }))}
                as="textarea"
                style={{ width: "100%" }}
              />
            </div>
          </Animation.Collapse>

          <Header>Перечень товаров, работ, услуг</Header>
          <LotPositionsTable
            data={
              positionsTableData?.length
                ? positionsTableData.map((position) => ({
                  ...position,
                  okato: purchasePlanPositionQuery.data.okato,
                  okpd_field: `${position.okpd_code}. ${position.okpd_name}`,
                  okved_field: `${position.okved_code}. ${position.okved_name}`,
                  qty_count: `${position.qty || "Не определено"}, ${position.unit_name || "Не определено"}`,
                }))
                : []
            }
            // addPositions={(positions) => setFormGlobalValues(state => ({ ...state, lots: [{ ...(formGlobalValues?.lots?.length ? formGlobalValues.lots[0] : {}), },] }))}
            addPositions={(positions) => setFormGlobalValues(state => ({
              ...state, lots: [
                {
                  ...(formGlobalValues?.lots?.length ? formGlobalValues.lots[0] : {}),
                  plan_positions: [...(state?.lots[0]?.plan_positions?.length ? state?.lots[0]?.plan_positions?.filter(pos => pos.id !== positions[0].id) : []), ...positions],
                },
              ],
            }))}
            setPositionsTableData={setPositionsTableData}
            isLoading={purchasePlanPositionQuery.isLoading}
          />
        </Panel>

        <Form.Group>
          <Button onClick={prevStep}>Назад</Button>
          <Button
            appearance="primary"
            onClick={handleSubmit}
            loading={isBtnLoader}
          >
            Сохранить и продолжить
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step4;
