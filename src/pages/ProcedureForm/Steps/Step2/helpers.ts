import sendToast from "../../../../utils/sendToast";
import { ProcedureMethodVariants, ProcedureSectionVariants } from "../../types";

interface Step2InitFormValues {
  contract_conclude_type: string;
  count_participant_ranked_lower_than_first: string;
  reduction_ratio_from: string;
  reduction_ratio_to: string;
  options: string[];
  bid_part_type: "ONE" | "SECOND";
}

interface Step2InitGlobalFormValues {
  contract_type: string;
  bidding_per_unit: boolean;
  more_than_one_protocol: boolean;
  position_purchase: boolean;
  reduction_factor_purchase: boolean;
  reduction_factor_purchase_from: number;
  reduction_factor_purchase_to: number;
  is_rebidding: boolean;
  count_participant_ranked_lower_than_first: number;
  bid_part: "ONE" | "SECOND";
  cause_failed: null;
  contract_by_any_participant: boolean;
  criteria_evaluation: null;
  currency: "RUB";
  currency_rate: 1;
  currency_rate_date: null;
}

interface Step2InitGlobalServerValues {
  isViaPlan: boolean;
  purchasePlanId?: string | null;
  purchasePlanNumber?: string | null;
  planPositionNumber?: number | null;
  procedureMethod: ProcedureMethodVariants;
}

interface Step2FinalGlobalServerValues {
  options: string[];
}

interface InitStep2ValuesPayload {
  globalFormValues: Step2InitGlobalFormValues;
  globalServerValues: Step2FinalGlobalServerValues;
}

export const initStep2Values = (
  payload: InitStep2ValuesPayload
): Step2InitFormValues => {
  const { globalFormValues, globalServerValues } = payload;
  const options: string[] = [];

  if (globalFormValues.contract_type) {
    options.push("contract_by_any_participant_option");
  }
  if (globalFormValues.position_purchase) {
    options.push("bidding_per_position_option");
  }
  if (globalFormValues.reduction_factor_purchase) {
    options.push("reduction_ratio_option");
  }
  if (globalFormValues.more_than_one_protocol) {
    options.push("protocols_count_more_option");
  }
  if (globalFormValues.bidding_per_unit) {
    options.push("bidding_per_unit");
  }
  if (globalFormValues.is_rebidding) {
    options.push("rebidding_option");
  }

  return {
    contract_conclude_type: globalFormValues?.contract_type || "ON_SITE",
    options,
    count_participant_ranked_lower_than_first: "",
    reduction_ratio_from:
      globalFormValues?.reduction_factor_purchase_from?.toString() || "0",
    reduction_ratio_to:
      globalFormValues?.reduction_factor_purchase_to?.toString() || "1",
    bid_part_type: "ONE",
  };
};

export const checkStep2Values = (formValues: Step2InitFormValues) => {
  const displayErrors: Partial<Step2InitFormValues> = {};

  const biddingPerPositionOption = formValues.options.includes(
    "bidding_per_position_option"
  );
  const biddingPerUnitOption = formValues.options.includes(
    "bidding_per_unit_option"
  );
  const reductionRatioOption = formValues.options.includes(
    "reduction_ratio_option"
  );
  const protocolsCountMoreOption = formValues.options.includes(
    "protocols_count_more_option"
  );
  const contractByAnyParticipantOption = formValues.options.includes(
    "contract_by_any_participant_option"
  );

  if (!contractByAnyParticipantOption) {
    if (!parseInt(formValues.count_participant_ranked_lower_than_first)) {
      displayErrors.count_participant_ranked_lower_than_first =
        "Поле обязательно для заполнения";
    }
  }

  if (Object.keys(displayErrors)?.length) {
    return displayErrors;
  }
};

interface IDispatchedStep2Values {
  globalFormValues: Step2InitGlobalFormValues;
  globalServerValues: Step2FinalGlobalServerValues;
}

export const dispatchStep2Values = (
  formValues: Step2InitFormValues
): IDispatchedStep2Values => {
  const biddingPerPositionOption = formValues.options.includes(
    "bidding_per_position_option"
  );
  const biddingPerUnitOption = formValues.options.includes(
    "bidding_per_unit_option"
  );
  const reductionRatioOption = formValues.options.includes(
    "reduction_ratio_option"
  );
  const protocolsCountMoreOption = formValues.options.includes(
    "protocols_count_more_option"
  );
  const contractByAnyParticipantOption = formValues.options.includes(
    "contract_by_any_participant_option"
  );
  const rebiddingOption = formValues.options.includes("rebidding_option");
  return {
    globalFormValues: {
      bidding_per_unit: biddingPerUnitOption,
      contract_type: formValues.contract_conclude_type,
      is_rebidding: rebiddingOption,
      reduction_factor_purchase: reductionRatioOption,
      reduction_factor_purchase_from: parseFloat(
        formValues.reduction_ratio_from
      ),
      reduction_factor_purchase_to: parseFloat(formValues.reduction_ratio_to),
      more_than_one_protocol: protocolsCountMoreOption,
      position_purchase: biddingPerPositionOption,
      bid_part: formValues.bid_part_type,
      cause_failed: null,
      contract_by_any_participant: contractByAnyParticipantOption,
      count_participant_ranked_lower_than_first: contractByAnyParticipantOption
        ? 1
        : parseFloat(formValues.count_participant_ranked_lower_than_first),
      criteria_evaluation: null,
      currency: "RUB",
      currency_rate: 1,
      currency_rate_date: null,
    },
    globalServerValues: {
      options: formValues.options,
    },
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
