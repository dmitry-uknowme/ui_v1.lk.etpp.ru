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
  InputNumber,
} from "rsuite";
import CurrencyInput from "react-currency-masked-input";
import { v4 as uuidv4 } from "uuid";
import React, { useContext, useEffect, useState } from "react";
import currency from "currency.js";
import { useQuery } from "react-query";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import fetchPurchasePlanPosition from "../../../../services/api/fetchPurchasePlanPosition";
import LotPositionsTable from "../../../../components/Table/LotPositionsTable";
import Money, { parseCurrency, parseDBMoney } from "../../../../utils/money";
import { parseDBAmount } from "../../../../utils/newMoney";
import { ProcedureFormActionVariants } from "../..";
import fetchLotPositions from "../../../../services/api/fetchLotPositions";
import sendToast from "../../../../utils/sendToast";
import {
  checkStep4Values,
  dispatchStep4Values,
  initStep4Values,
} from "./helpers";
import { ProcedureMethodVariants } from "../../types";
import isProcedureAnyAuction from "../../../../utils/isProcedureAnyAuction";

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
  // lot_start_price: StringType().isRequired("Поле обязательно для заполнения"),
});

const Step4 = ({
  currentStep,
  setCurrentStep,
  nextStep,
  prevStep,
  actionType,
}) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const isProcedureAuction = isProcedureAnyAuction(
    formGlobalServerData.procedureMethod
  );

  const isViaPlan = formGlobalServerData.isViaPlan;
  const isEditType =
    formGlobalServerData.actionType === ProcedureFormActionVariants.EDIT;
  const [isBtnLoader, setBtnLoader] = useState<boolean>(false);
  const isBiddingPerUnitOption = !!formGlobalValues?.bidding_per_unit;
  const serverProcedure = formGlobalServerData.procedure;
  // console.log('dddd', !isEditType && !isViaPlan)
  const [positionsTableData, setPositionsTableData] = useState(
    formGlobalServerData?.positionsTableData
      ? formGlobalServerData?.positionsTableData
      : !isViaPlan
      ? [
          {
            id: "null",
            qty: "",
            unit_name: "",
            qty_count: null,
            region: null,
            okpd_code: "",
            okpd_name: "",
            okved_code: "",
            okved_name: "",
          },
        ]
      : []
  );

  useEffect(() => {
    setFormGlobalServerData((state) => ({ ...state, positionsTableData }));
  }, [positionsTableData]);

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState(
    initStep4Values({
      globalFormValues: formGlobalValues,
      globalServerValues: formGlobalServerData,
    })
  );

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
      const lotId = formGlobalServerData?.lotId ?? null;
      if (actionType === ProcedureFormActionVariants.EDIT || lotId) {
        const positions = await fetchLotPositions({ lotId });
        // console.log('positionssss', positions.map(pos => ({ ...pos, amount: `${pos?.price?.currency} ${pos?.price?.amount}` })))
        // if (positions?.length && !positionsTableData.length) {
        setPositionsTableData(
          /* ...(!isViaPlan ? { id: "null" } : {}) */
          // [{ id: !isViaPlan ? "null" : null },
          positions.map((pos, number) => ({
            ...pos,
            number: number + 1,
            amount: pos?.price?.amount
              ? `${currency(parseDBAmount(pos?.price?.amount) / 100)}`
              : null,
          }))
        );
        // }
        // return { positions: positions.map(pos => ({ ...pos, region: `${pos.region_name} ${pos.region_address}` })) }
        // }
      } else {
        const planPosition = await fetchPurchasePlanPosition({
          planId,
          planPositionId,
        });
        if (planPosition?.positions?.length) {
          if (!positionsTableData?.length) {
            setPositionsTableData(planPosition.positions);
          }
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
      }
    },
    {
      // enabled: isViaPlan,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      // refetchOnWindowFocus: false,
      // refetchOnMount: false,
    }
  );

  const biddingPerPositionOption =
    formGlobalServerData?.options?.includes("bidding_per_position_option") ??
    false;
  // const notify = () => toast("Wow so easy!");

  const handleSubmit = () => {
    const bidProvisionAmount = formValue.provision_bid_amount;
    const bidProvisionPercent = formValue.provision_bid_percent;

    const contractProvisionType = formValue.provision_contract_type;
    const contractProvisionAmount = formValue.provision_contract_amount;
    const contractProvisionPercent = formValue.provision_contract_percent;
    if (!formRef.current.check()) {
      sendToast("error", "Пожалуйста заполните необходимые поля формы");
      return;
    }

    const errors = checkStep4Values(
      formValue,
      formGlobalValues,
      formGlobalServerData
    );
    if (errors) {
      setFormError((state) => ({ ...state, ...errors }));
      return;
    }

    const {
      globalFormValues: finalGlobalFormValues,
      globalServerValues: finalGlobalServerValues,
    } = dispatchStep4Values(formValue, formGlobalValues, formGlobalServerData);

    setFormGlobalValues((state) => ({ ...state, ...finalGlobalFormValues }));
    setFormGlobalServerData((state) => ({
      ...state,
      ...finalGlobalServerValues,
    }));

    nextStep();

    // if (biddingPerPositionOption) {
    //   const defaultPlanPositions = positionsTableData;
    //   const positions = formGlobalValues?.lots[0]?.plan_positions;
    //   if (actionType !== ProcedureFormActionVariants.EDIT) {
    //     if (!positions || positions?.length !== defaultPlanPositions?.length) {
    //       sendToast("error", "Не всем позициям проставлена цена за единицу");
    //       // toaster.push(
    //       //   <Message type="error">
    //       //     Не всем позициям проставлена цена за единицу
    //       //   </Message>
    //       // );
    //       return;
    //     }
    //     const positionsSum = positions.reduce(
    //       (acc, curr) => acc.add(currency(parseDBAmount(curr.amount) / 100)),
    //       currency(0)
    //     );
    //     console.log(
    //       "summm ",
    //       positionsSum,
    //       currency(parseFloat(formValue.lot_start_price))
    //     );
    //     if (
    //       positionsSum.intValue >
    //       currency(parseFloat(formValue.lot_start_price)).intValue
    //     ) {
    //       sendToast(
    //         "error",
    //         `Сумма позиций превышает НМЦ лота. Вы ввели ${positionsSum.toString()}. НМЦ лота - ${currency(
    //           parseFloat(formValue.lot_start_price)
    //         ).toString()}`
    //       );
    //       // toaster.push(
    //       //   <Message type="error">Сумма позиций превышает НМЦ лота</Message>
    //       // );
    //       return;
    //     }
    //   }

    //   // if (defaultPlanPositions.length !== formGlobalValues?.lots[0]?.positions?.length) {
    //   //   toaster.push(<Message type='error'>Не всем позициям лота проставлена цена</Message>)
    //   //   return
    //   // }
    // }
    // if (isBiddingPerUnitOption) {
    //   if (!parseFloat(formValue.lot_unit_start_price)) {
    //     setFormError((state) => ({
    //       ...state,
    //       lot_unit_start_price: "Поле обязательно для заполнения",
    //     }));
    //     setBtnLoader(false);
    //     return;
    //   }
    // }

    // if (!formRef.current.check()) {
    //   sendToast(
    //     "error",
    //     "Пожалуйста, исправьте ошибки перед тем, как перейте на следующий шаг"
    //   );

    //   document
    //     .querySelector(".rs-form-group .rs-form-error-message")
    //     ?.parentNode?.parentNode?.scrollIntoView();
    //   document.querySelector(".rs-form-error-message-inner")?.scrollIntoView();
    //   return;
    // }
    // setBtnLoader(false);
    // nextStep();
  };

  useEffect(() => {
    if (isContractProvisionSpecified) {
      const startPrice = parseFloat(formValue.lot_start_price);
      // const startPrice = currency(parseFloat(formValue.lot_start_price));
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
        provision_contract_amount: parseFloat(
          startPrice * (provisionContractPercent / 100)
        ).toFixed(2),
        // .multiply(provisionContractPercent)
        // .divide(100)
        // .toString(),
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
        const startPrice = parseFloat(formValue.lot_start_price);
        // const startPrice = currency(parseFloat(formValue.lot_start_price));
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
          provision_bid_amount: parseFloat(
            (startPrice * provisionBidPercent) / 100
          ).toFixed(2),

          // provision_bid_amount: startPrice
          //   .multiply(provisionBidPercent)
          //   .divide(100)
          //   .toString(),
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
      setFormValue((state) => ({ ...state, lot_title: formGlobalValues.name }));
    }
  }, [formGlobalValues.name]);

  console.log("table dataaa", positionsTableData);
  useEffect(() => {
    if (!Object.keys(formError).length) {
      setBtnLoader(false);
    }
  }, [formError]);
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
            className="rs-input"
            value={formValue.lot_start_price}
            onChange={(e, value) =>
              setFormValue((state) => ({
                ...state,
                lot_start_price: value.toString(),
              }))
            }
            accepter={CurrencyInput}
            scrolling={false}
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
                  scrollable={false}
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
                  scrollable={false}
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
                onChange={(value) =>
                  setFormValue((state) => ({
                    ...state,
                    provision_bid_payment_return_deposit: value,
                  }))
                }
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
                  scrollable={false}
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
                  scrollable={false}
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
                onChange={(value) =>
                  setFormValue((state) => ({
                    ...state,
                    provision_contract_payment_return_deposit: value,
                  }))
                }
                as="textarea"
                style={{ width: "100%" }}
              />
            </div>
          </Animation.Collapse>

          <Header>Перечень товаров, работ, услуг</Header>
          <LotPositionsTable
            // tableType={ProcedureFormActionVariants.CREATE}
            data={
              positionsTableData?.length
                ? positionsTableData
                    .sort((a, b) =>
                      parseInt(a.number) || a.id === "null" < parseInt(b.number)
                        ? -1
                        : 1
                    )
                    .map((position) => ({
                      ...position,
                      okato:
                        position.id === "null"
                          ? null
                          : position?.region_okato ||
                            purchasePlanPositionQuery?.data?.okato ||
                            null,
                      unit_name:
                        position.id === "null" ? null : position.unit_name,
                      okpd_field:
                        position.id === "null"
                          ? null
                          : `${position.okpd_code}. ${position.okpd_name} `,
                      okved_field:
                        position.id === "null"
                          ? null
                          : `${position.okved_code}. ${position.okved_name} `,
                      qty_count:
                        position.id === "null"
                          ? null
                          : position?.qty_count
                          ? position.qty_count
                          : position.qty && position.unit_name
                          ? `${position.qty || "Не определено"}, ${
                              position.unit_name || "Не определено"
                            }`
                          : null,
                      region:
                        position.id === "null"
                          ? null
                          : (position?.region_address || position?.address) &&
                            (position?.region || position?.region_name)
                          ? `${position?.region || position?.region_name} , ${
                              position?.region_address || position?.address
                            }`
                          : position.region_address,

                      address:
                        position.id === "null"
                          ? null
                          : position?.region_address || "",
                      extra_info:
                        position.id === "null"
                          ? null
                          : position?.addition_info || position?.info || "",
                    }))
                : []
            }
            isViaPlan={isViaPlan}
            addPositions={(positions) => {
              console.log("posssssss", { positions, positionsTableData });
              if (positions?.id === "null") {
                // if (positionsTableData?.length && positionsTableData[0]?.id === 'null') {
                if (isViaPlan) {
                  setFormGlobalValues((state) => ({
                    ...state,
                    lots: [
                      {
                        ...(formGlobalValues?.lots?.length
                          ? formGlobalValues.lots[0]
                          : {}),
                        plan_positions: [
                          ...(state?.lots[0]?.plan_positions?.length
                            ? [...state?.lots[0]?.plan_positions]
                            : []),
                          { ...positions },
                        ],
                      },
                    ],
                  }));
                } else {
                  setFormGlobalValues((state) => ({
                    ...state,
                    lots: [
                      {
                        ...(formGlobalValues?.lots?.length
                          ? formGlobalValues.lots[0]
                          : {}),
                        positions: [
                          ...(state?.lots[0]?.positions?.length
                            ? [...state?.lots[0]?.positions]
                            : []),
                          { ...positions },
                        ],
                      },
                    ],
                  }));
                }
              } else {
                if (isViaPlan) {
                  setFormGlobalValues((state) => ({
                    ...state,
                    lots: [
                      {
                        ...(formGlobalValues?.lots?.length
                          ? formGlobalValues.lots[0]
                          : {}),
                        plan_positions: [
                          ...(state?.lots[0]?.plan_positions?.length
                            ? state?.lots[0]?.plan_positions?.filter(
                                (pos) => pos.id !== positions.id
                              )
                            : []),
                          { ...positions },
                        ],
                      },
                    ],
                  }));
                } else {
                  setFormGlobalValues((state) => ({
                    ...state,
                    lots: [
                      {
                        ...(formGlobalValues?.lots?.length
                          ? formGlobalValues.lots[0]
                          : {}),
                        positions: [
                          ...(state?.lots[0]?.positions?.length
                            ? state?.lots[0]?.positions?.filter(
                                (pos) => pos.id !== positions.id
                              )
                            : []),
                          { ...positions },
                        ],
                      },
                    ],
                  }));
                }
              }
              console.log("adddddddd", positions);
              // setFormGlobalValues((state) => ({
              //   ...state,
              //   lots: [
              //     {
              //       ...(formGlobalValues?.lots?.length
              //         ? formGlobalValues.lots[0]
              //         : {}),
              //       plan_positions: [
              //         ...(state?.lots[0]?.plan_positions?.length
              //           ? isViaPlan
              //             ? state?.lots[0]?.plan_positions?.filter(
              //               (pos) => pos.id !== positions.id
              //             )
              //             : []
              //           : []),
              //       ],
              //       positions: [
              //         ...(state?.lots[0]?.positions?.length
              //           ? !isViaPlan
              //             ? [...state?.lots[0]?.positions]
              //             : []
              //           : []),
              //         positions,
              //       ],
              //     },
              //   ],
              // }));
            }}
            setPositionsTableData={setPositionsTableData}
            options={formGlobalServerData.options}
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
