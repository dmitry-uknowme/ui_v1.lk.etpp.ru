import { add } from "date-fns";
import formatDate from "../../../../utils/formatDate";
import sendToast from "../../../../utils/sendToast";
import { ProcedureMethodVariants, ProcedureSectionVariants } from "../../types";

interface Step3InitFormValues {
  start_acceipting_bids_date: Date;
  end_acceipting_bids_date: Date;
  reviewing_bids_date: Date;
  summing_up_bids_date: Date;
  bidding_process: string;
  order_review_and_summing_up: string;
  place_review_and_summing_up: string;
  procedure_process: string;
  info_trading_venue: string;
  providing_documentation_explanation: string;
  requirements_participant: string;
  provision_procurement_documentation: string;
  other_info_by_customer: string;
}

interface Step3InitGlobalFormValues {
  lots?:
    | [
        {
          date_time?: {
            start_bids: string;
            close_bids: string;
            review_bids: string;
            summing_up_end: string;
          } | null;
        }
      ]
    | null;
  bidding_process: string;
  order_review_and_summing_up: string;
  place_review_and_summing_up: string;
  procedure_process: string;
  info_trading_venue: string;
  providing_documentation_explanation: string;
  requirements_participant: string;
  provision_procurement_documentation: string;
  other_info_by_customer: string;
}

interface Step3InitGlobalServerValues {
  isViaPlan: boolean;
  purchasePlanId?: string | null;
  purchasePlanNumber?: string | null;
  planPositionNumber?: number | null;
  procedureMethod: ProcedureMethodVariants;
}

interface Step3FinalGlobalServerValues {}

interface InitStep3ValuesPayload {
  globalFormValues: Step3InitGlobalFormValues;
  globalServerValues: Step3FinalGlobalServerValues;
}

export const initStep3Values = (
  payload: InitStep3ValuesPayload
): Step3InitFormValues => {
  const { globalFormValues, globalServerValues } = payload;

  return {
    start_acceipting_bids_date:
      globalFormValues?.lots?.length &&
      globalFormValues?.lots[0]?.date_time?.start_bids
        ? new Date(globalFormValues?.lots[0]?.date_time?.start_bids)
        : add(new Date(), { minutes: 1 }),
    end_acceipting_bids_date:
      globalFormValues?.lots?.length &&
      globalFormValues?.lots[0]?.date_time?.close_bids
        ? new Date(globalFormValues?.lots[0]?.date_time?.close_bids)
        : add(new Date(), { minutes: 2 }),
    reviewing_bids_date:
      globalFormValues?.lots?.length &&
      globalFormValues?.lots[0]?.date_time?.review_bids
        ? new Date(globalFormValues?.lots[0]?.date_time?.review_bids)
        : add(new Date(), { minutes: 3 }),
    summing_up_bids_date:
      globalFormValues?.lots?.length &&
      globalFormValues?.lots[0]?.date_time?.summing_up_end
        ? new Date(globalFormValues?.lots[0]?.date_time?.summing_up_end)
        : add(new Date(), { minutes: 4 }),
    bidding_process:
      globalFormValues?.bidding_process ||
      "В соответствии с закупочной документацией",
    order_review_and_summing_up:
      globalFormValues?.order_review_and_summing_up ||
      "В соответствии с закупочной документацией",
    place_review_and_summing_up:
      globalFormValues?.place_review_and_summing_up ||
      "В соответствии с закупочной документацией",
    procedure_process:
      globalFormValues?.procedure_process ||
      "В соответствии с закупочной документацией",
    info_trading_venue:
      globalFormValues?.info_trading_venue ||
      "В соответствии с закупочной документацией",
    providing_documentation_explanation:
      globalFormValues?.providing_documentation_explanation ||
      "В соответствии с закупочной документацией",
    requirements_participant:
      globalFormValues?.requirements_participant ||
      "В соответствии с закупочной документацией",
    other_info_by_customer:
      globalFormValues?.other_info_by_customer ||
      "В соответствии с закупочной документацией",
    provision_procurement_documentation:
      globalFormValues?.provision_procurement_documentation ||
      "В соответствии с закупочной документацией",
  };
};

export const checkStep3Values = (formValues: Step3InitFormValues) => {
  const displayErrors: Partial<Step3InitFormValues> = {};

  // if (Object.keys(displayErrors)?.length) {
  //   return displayErrors;
  // }
};

interface IDispatchedStep2Values {
  globalFormValues: Step3InitGlobalFormValues;
  globalServerValues: Step3FinalGlobalServerValues;
}

export const dispatchStep3Values = (
  formValues: Step3InitFormValues,
  formGlobalValues: Step3InitGlobalFormValues
): IDispatchedStep2Values => {
  return {
    globalFormValues: {
      lots: [
        {
          ...(formGlobalValues?.lots?.length ? formGlobalValues.lots[0] : {}),
          date_time: {
            start_bids: formatDate(formValues.start_acceipting_bids_date),
            close_bids: formatDate(formValues.end_acceipting_bids_date),
            review_bids: formatDate(formValues.reviewing_bids_date),
            summing_up_end: formatDate(formValues.summing_up_bids_date),
          },
        },
      ],
      bidding_process: formValues.bidding_process,
      info_trading_venue: formValues.info_trading_venue,
      order_review_and_summing_up: formValues.order_review_and_summing_up,
      other_info_by_customer: formValues.other_info_by_customer,
      place_review_and_summing_up: formValues.place_review_and_summing_up,
      procedure_process: formValues.procedure_process,
      providing_documentation_explanation:
        formValues.providing_documentation_explanation,
      provision_procurement_documentation:
        formValues.provision_procurement_documentation,
      requirements_participant: formValues.requirements_participant,
    },
    globalServerValues: {},
  };
};

//  setFormGlobalValues((state) => ({
//    ...state,
//    position_purchase: biddingPerPositionOption,
//    bidding_per_unit: reductionRatioOption,
//    reduction_factor_purchase: reductionRatioOption,
//    reduction_factor_purchase_to: parseFloat(formValue.reduction_ratio_to),
//    reduction_factor_purchase_from: parseFloat(formValue.reduction_ratio_from),
//    more_than_one_protocol: protocolsCountMoreOption,
//    contract_type: contractConcludeType,
//    bid_part: "ONE",
//    cause_failed: null,
//    is_rebidding: isProcedureCompetitiveSelection
//      ? true
//      : formValue.options.includes("rebidding_option"),
//    count_participant_ranked_lower_than_first: contractByAnyParticipantOption
//      ? 1
//      : parseInt(formValue.count_participant_ranked_lower_than_first),
//    criteria_evaluation: null,
//    currency: "RUB",
//    currency_rate: 1,
//    currency_rate_date: null,
//    contract_by_any_participant: contractByAnyParticipantOption,
//  }));
//  setFormGlobalServerData((state) => ({
//    ...state,
//    options: formValue.options,
//  }));
