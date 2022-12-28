import currency from "currency.js";
import { parseDBAmount } from "../../../../utils/newMoney";
import sendToast from "../../../../utils/sendToast";
import { ProcedureMethodVariants, ProcedureSectionVariants } from "../../types";

interface Step4InitFormValues {
  lot_start_price: string;
  lot_title: string;
  lot_currency: string;
  nds_type: string;
  provision_bid_type: string;
  provision_bid_amount: string;
  provision_bid_percent: string;
  provision_bid_methods: string[];
  provision_contract_type: string;
  provision_contract_amount: string;
  provision_contract_percent: string;
  lot_unit_start_price: string;
  provision_bid_payment_return_deposit: string;
  provision_contract_payment_return_deposit: string;
}

interface Step4InitGlobalServerValues {
  isViaPlan?: boolean;
  purchasePlanId?: string;
}

interface Step4InitGlobalFormValues {
  original_price?: string;
  lots?: [
    {
      name?: string;
      nds_type?: string;
      positions?: any[];
      plan_positions?: any[];
    }
  ];
  provision_bid?: {
    is_specified?: boolean | null;
    methods?: string[];
    amount?: string | null;
    percent?: number | null;
    payment_return_deposit?: string | null;
  };
  provision_contract?: {
    type?: string;
    is_specified?: boolean;
    methods?: string[];
    amount?: string | null;
    percent?: number | null;
    payment_return_deposit?: string | null;
  };
  bidding_per_unit_amount?: string | null;
}

interface Step4FinalGlobalFormValues {
  plan_position_id?: string | null;
  name: string;
  platform: ProcedureSectionVariants;
  requirement_not_rnp: boolean;
  is_for_smb: boolean;
  is_subcontractor_requirement: boolean;
}

interface Step4FinalGlobalServerValues {
  provision_bid?: { amount?: string | null; percent?: string | null } | null;
  provision_contract?: {
    amount?: string | null;
    percent?: string | null;
  } | null;
}

interface InitStep4ValuesPayload {
  globalFormValues: Step4InitGlobalFormValues;
  globalServerValues: Step4FinalGlobalServerValues;
}

//  const [formValue, setFormValue] = React.useState({
//    lot_start_price: formGlobalValues?.original_price
//      ? currency(parseDBAmount(formGlobalValues.original_price) / 100).toString()
//      : "",
//    lot_title:
//      formGlobalValues?.name || formGlobalValues?.lots?.length
//        ? formGlobalValues.lots[0].name
//        : "",
//    lot_currency: "RUB",
//    nds_type:
//      formGlobalValues?.lots?.length && formGlobalValues?.lots[0]?.nds_type
//        ? formGlobalValues?.lots[0]?.nds_type
//        : "NO_NDS",
//    provision_bid_type: formGlobalValues?.provision_bid?.methods?.length
//      ? formGlobalValues?.provision_bid?.methods[0]
//      : "WITHOUT_COLLATERAL",
//    provision_bid_amount: formGlobalServerData?.provision_bid?.amount
//      ? currency(
//          parseDBAmount(formGlobalServerData?.provision_bid?.amount) / 100
//        ).toString()
//      : "",
//    provision_bid_percent: formGlobalServerData?.provision_bid?.percent
//      ? parseFloat(formGlobalServerData.provision_bid.percent).toFixed(2)
//      : "",
//    provision_bid_methods: formGlobalValues?.provision_bid?.methods || [],
//    provision_contract_type:
//      formGlobalValues?.provision_contract?.is_specified === false
//        ? "NOT_SPECIFIED"
//        : formGlobalValues?.provision_contract?.type || "NOT_SPECIFIED",
//    provision_contract_amount: formGlobalServerData?.provision_contract?.amount
//      ? currency(
//          parseDBAmount(formGlobalServerData.provision_contract.amount) / 100
//        ).toString()
//      : "",
//    provision_contract_percent: formGlobalServerData?.provision_contract?.percent
//      ? parseFloat(formGlobalServerData.provision_contract.percent).toFixed(2)
//      : "",
//    lot_unit_start_price: formGlobalValues?.bidding_per_unit_amount
//      ? currency(
//          parseDBAmount(formGlobalValues.bidding_per_unit_amount) / 100
//        ).toString()
//      : "",
//    provision_bid_payment_return_deposit:
//      formGlobalValues?.provision_bid?.payment_return_deposit ||
//      "В соответствии с закупочной документацией",
//    provision_contract_payment_return_deposit:
//      formGlobalValues?.provision_contract?.payment_return_deposit ||
//      "В соответствии с закупочной документацией",

export const initStep4Values = (
  payload: InitStep4ValuesPayload
): Step4InitFormValues => {
  const { globalFormValues, globalServerValues } = payload;

  return {
    lot_currency: "RUB",
    lot_start_price: globalFormValues?.original_price
      ? currency(
          parseDBAmount(globalFormValues.original_price) / 100
        ).toString()
      : "",
    lot_title:
      globalFormValues?.lots?.length && globalFormValues?.lots[0]?.name
        ? globalFormValues?.lots[0].name
        : "",
    lot_unit_start_price: globalFormValues?.bidding_per_unit_amount
      ? currency(
          parseDBAmount(globalFormValues.bidding_per_unit_amount) / 100
        ).toString()
      : "",
    nds_type:
      globalFormValues?.lots?.length && globalFormValues?.lots[0]?.nds_type
        ? globalFormValues?.lots[0]?.nds_type
        : "NO_NDS",
    provision_bid_amount: globalServerValues?.provision_bid?.amount
      ? currency(
          parseDBAmount(globalServerValues?.provision_bid?.amount) / 100
        ).toString()
      : "",
    provision_bid_percent: globalServerValues?.provision_bid?.percent
      ? parseFloat(globalServerValues.provision_bid.percent).toFixed(2)
      : "",

    provision_bid_type: globalFormValues?.provision_bid?.methods?.length
      ? globalFormValues?.provision_bid?.methods[0]
      : "WITHOUT_COLLATERAL",
    provision_bid_methods: globalFormValues?.provision_bid?.methods || [],
    provision_bid_payment_return_deposit:
      globalFormValues?.provision_bid?.payment_return_deposit ||
      "В соответствии с закупочной документацией",
    provision_contract_amount: globalServerValues?.provision_contract?.amount
      ? currency(
          parseDBAmount(globalServerValues.provision_contract.amount) / 100
        ).toString()
      : "",
    provision_contract_percent: globalServerValues?.provision_contract?.percent
      ? parseFloat(globalServerValues.provision_contract.percent).toFixed(2)
      : "",
    provision_contract_type:
      globalFormValues?.provision_contract?.is_specified === false
        ? "NOT_SPECIFIED"
        : globalFormValues?.provision_contract?.type || "NOT_SPECIFIED",
    provision_contract_payment_return_deposit:
      globalFormValues?.provision_contract?.payment_return_deposit ||
      "В соответствии с закупочной документацией",
  };
};

export const checkStep4Values = (
  formValues: Step4InitFormValues,
  globalFormValues: Step4InitGlobalFormValues,
  globalServerValues: any
) => {
  const displayErrors: Partial<Step4InitFormValues> = {};

  const isViaPlan = globalServerValues.isViaPlan;
  const positionsTableData = globalServerValues.positionsTableData;

  if (!isViaPlan) {
    if (
      !positionsTableData?.length ||
      !(
        globalFormValues?.lots?.length &&
        globalFormValues?.lots[0].positions?.length
      )
    ) {
      sendToast("error", "Вы не добавили позицию лота");
      return { "": "" };
    }
  }
  //   const isViaPlan = formValues.is_via_plan === "true";
  //   const planPositionId = formValues.purchase_method_id;

  //   if (isViaPlan && !planPositionId) {
  //     sendToast("error", "Вы не выбрали позицию из плана закупок");
  //     return { "": "" };
  //   }
  if (Object.keys(displayErrors)?.length) {
    return displayErrors;
  }
};

interface IDispatchedStep4Values {
  globalFormValues: Step4InitGlobalFormValues;
  globalServerValues: Step4FinalGlobalServerValues;
}

//  setFormGlobalServerData((state) => ({
//       ...state,
//       positionsTableData: positionsTableData,
//       provision_bid: {
//         amount: isBidProvisionSpecified
//           ? `RUB ${currency(parseFloat(formValue.provision_bid_amount)).intValue
//           }`
//           : null,
//         percent: isBidProvisionSpecified
//           ? parseFloat(bidProvisionPercent)
//           : null,
//       },
//       provision_contract: {
//         amount: isContractProvisionSpecified
//           ? `RUB ${currency(parseFloat(formValue.provision_contract_amount)).intValue
//           }`
//           : null,
//         percent: isContractProvisionSpecified
//           ? parseFloat(contractProvisionPercent)
//           : null,
//       },
//     }));

//     setFormGlobalValues((state) => ({
//       ...state,
//       name: formValue.lot_title,
//       bidding_per_unit_amount: isBiddingPerUnitOption
//         ? `${"RUB"} ${currency(parseFloat(formValue.lot_unit_start_price)).intValue
//         } `
//         : null,
//       provision_bid: {
//         is_specified: isBidProvisionSpecified,
//         amount:
//           isBidProvisionSpecified && isBidProvisionFixed
//             ? `RUB ${currency(parseFloat(formValue.provision_bid_amount)).intValue
//             }`
//             : null,
//         methods: [formValue.provision_bid_type],
//         payment_return_deposit: formValue.provision_bid_payment_return_deposit,
//         percent:
//           isBidProvisionSpecified &&
//             (isBidProvisionPercent || isBidProvisionByDocumentation)
//             ? parseFloat(bidProvisionPercent)
//             : null,
//       },
//       provision_contract: {
//         is_specified: isContractProvisionSpecified,
//         type: isContractProvisionSpecified
//           ? contractProvisionType
//           : "FROM_START_PRICE",
//         amount:
//           isContractProvisionSpecified && isContractProvisionFromStartPrice
//             ? parseFloat(contractProvisionAmount)
//               ? `${"RUB"} ${currency(parseFloat(contractProvisionAmount)).intValue
//               } `
//               : "RUB 0"
//             : null,
//         percent:
//           isContractProvisionSpecified && isContractProvisionFromContractPrice
//             ? parseFloat(contractProvisionPercent)
//             : null,
//         payment_return_deposit:
//           formValue.provision_contract_payment_return_deposit,
//       },
//       original_price: `${"RUB"} ${currency(parseFloat(formValue.lot_start_price)).intValue
//         } `,
//       lots: [
//         {
//           ...(formGlobalValues?.lots?.length ? formGlobalValues?.lots[0] : {}),
//           name: formValue.lot_title,
//           starting_price: `${"RUB"} ${currency(parseFloat(formValue.lot_start_price)).intValue
//             } `,
//           // positions: isBiddingPerUnitOption ? [] : [],
//           nds_type: formValue.nds_type,
//           plan_positions: formGlobalValues?.lots[0]?.plan_positions?.length
//             ? formGlobalValues?.lots[0]?.plan_positions
//             : [],
//         },
//       ],
//     }));

export const dispatchStep4Values = (
  formValues: Step4InitFormValues,
  globalFormValues: any,
  globalServerValues: any
): IDispatchedStep4Values => {
  const isViaPlan = globalFormValues.isViaPlan;
  const isBidProvisionSpecified =
    formValues.provision_bid_type !== "WITHOUT_COLLATERAL";
  const isContractProvisionSpecified =
    formValues.provision_contract_type !== "NOT_SPECIFIED";
  const isBidProvisionFixed = formValues.provision_bid_type === "FIXED_AMOUNT";
  const isBidProvisionPercent =
    formValues.provision_bid_type === "PERCENTAGE_AMOUNT";
  const isBidProvisionByDocumentation =
    formValues.provision_bid_type === "ACCORDING_DOCUMENTATION";
  const isContractProvisionFromStartPrice =
    formValues.provision_contract_type === "FROM_START_PRICE";
  const isContractProvisionFromContractPrice =
    formValues.provision_contract_type === "FROM_CONTRACT_PRICE";

  const bidProvisionAmount = formValues.provision_bid_amount;
  const bidProvisionPercent = formValues.provision_bid_percent;

  const contractProvisionType = formValues.provision_contract_type;
  const contractProvisionAmount = formValues.provision_contract_amount;
  const contractProvisionPercent = formValues.provision_contract_percent;
  const isBiddingPerUnitOption = !!globalServerValues?.bidding_per_unit;
  return {
    globalFormValues: {
      bidding_per_unit_amount: isBiddingPerUnitOption
        ? `${"RUB"} ${
            currency(parseFloat(formValues.lot_unit_start_price)).intValue
          } `
        : null,
      lots: [
        {
          ...(globalFormValues?.lots?.length ? globalFormValues.lots[0] : {}),
          name: formValues.lot_title,
          nds_type: formValues.nds_type,
          starting_price: `${"RUB"} ${
            currency(parseFloat(formValues.lot_start_price)).intValue
          } `,
          plan_positions: isViaPlan
            ? [
                ...(globalFormValues?.lots[0]?.plan_positions?.length
                  ? globalFormValues?.lots[0]?.plan_positions
                  : []),
              ]
            : [],
          positions: !isViaPlan
            ? [
                ...(globalFormValues?.lots[0]?.positions?.length
                  ? globalFormValues?.lots[0]?.positions
                  : []),
              ]
            : [],
        },
      ],
      provision_bid: {
        is_specified: isBidProvisionSpecified,
        amount:
          isBidProvisionSpecified && isBidProvisionFixed
            ? `RUB ${
                currency(parseFloat(formValues.provision_bid_amount)).intValue
              }`
            : null,
        methods: [formValues.provision_bid_type],
        payment_return_deposit: formValues.provision_bid_payment_return_deposit,
        percent:
          isBidProvisionSpecified &&
          (isBidProvisionPercent || isBidProvisionByDocumentation)
            ? parseFloat(formValues.provision_bid_percent)
            : null,
      },
      provision_contract: {
        is_specified: isContractProvisionSpecified,
        type: isContractProvisionSpecified
          ? contractProvisionType
          : "FROM_START_PRICE",
        amount:
          isContractProvisionSpecified && isContractProvisionFromStartPrice
            ? parseFloat(contractProvisionAmount)
              ? `${"RUB"} ${
                  currency(parseFloat(contractProvisionAmount)).intValue
                } `
              : "RUB 0"
            : null,
        percent:
          isContractProvisionSpecified && isContractProvisionFromContractPrice
            ? parseFloat(contractProvisionPercent)
            : null,
        payment_return_deposit:
          formValues.provision_contract_payment_return_deposit,
      },
      original_price: `${"RUB"} ${
        currency(parseFloat(formValues.lot_start_price)).intValue
      }`,
    },
    globalServerValues: {},
  };
};
