import fetchPurchasePlanPosition from "../../../../services/api/fetchPurchasePlanPosition";
import sendToast from "../../../../utils/sendToast";
import { ProcedureMethodVariants, ProcedureSectionVariants } from "../../types";

interface Step1InitFormValues {
  is_via_plan: string;
  purchase_plan_id: string;
  purchase_method_id: string;
  procedure_title: string;
  procedure_section: ProcedureSectionVariants;
  procedure_method: ProcedureMethodVariants;
  options: string[];
}

interface Step1InitGlobalFormValues {
  plan_position_id?: string;
  name?: string;
  requirement_not_rnp?: boolean;
  is_for_smb?: boolean;
  is_subcontractor_requirement?: boolean;
  platform?: ProcedureSectionVariants;
}

interface Step1FinalGlobalFormValues {
  plan_position_id?: string | null;
  name: string;
  platform: ProcedureSectionVariants;
  requirement_not_rnp: boolean;
  is_for_smb: boolean;
  is_subcontractor_requirement: boolean;
}

interface Step1FinalGlobalServerValues {
  isViaPlan: boolean;
  purchasePlanId?: string | null;
  purchasePlanNumber?: string | null;
  planPositionNumber?: number | null;
  procedureMethod: ProcedureMethodVariants;
}

interface InitStep1ValuesPayload {
  globalFormValues: Step1InitGlobalFormValues;
  globalServerValues: Step1FinalGlobalServerValues;
}

export const initStep1Values = (
  payload: InitStep1ValuesPayload
): Step1InitFormValues => {
  const { globalFormValues, globalServerValues } = payload;
  const options = [];
  if (globalFormValues.requirement_not_rnp) {
    options.push("rnp_requirement_option");
  }
  if (globalFormValues.is_for_smb) {
    options.push("smb_participant_option");
  }
  if (globalFormValues.is_subcontractor_requirement) {
    options.push("subcontractor_option");
  }
  return {
    is_via_plan: globalServerValues?.isViaPlan?.toString() || "true",
    purchase_plan_id: globalServerValues?.purchasePlanId || "",
    purchase_method_id: globalFormValues?.plan_position_id || "",
    procedure_title: globalFormValues?.name || "",
    procedure_method:
      globalServerValues?.procedureMethod ||
      ProcedureMethodVariants.REQUEST_OFFERS,
    procedure_section:
      globalFormValues?.platform || ProcedureSectionVariants.SECTION_223_FZ,
    options,
  };
};

export const checkStep1Values = async (
  formValues: Step1InitFormValues,
  selectedPurchasePlan: any | null,
  selectedPurchasePlanPosition: any | null
) => {
  const displayErrors: Partial<Step1InitFormValues> = {};

  const isViaPlan = formValues.is_via_plan === "true";
  if (isViaPlan) {
    const planPositionId = formValues.purchase_method_id;
    const planId = selectedPurchasePlan.id;
    let procedureMethod = null;

    const planPosition = await fetchPurchasePlanPosition({
      planId,
      planPositionId,
    });

    procedureMethod = planPosition.procedure_system_type;
    const purchaseMethodEisCode = planPosition.purchase_method_code;
    if (!procedureMethod) {
      sendToast(
        "error",
        `Не найдено сопоставление по выбранной позиции плана. Код: ${purchaseMethodEisCode}`
      );
      return { "": "" };
    }
    if (!planPositionId) {
      sendToast("error", "Вы не выбрали позицию из плана закупок");
      return { "": "" };
    }
  }

  if (Object.keys(displayErrors)?.length) {
    return displayErrors;
  }
};

interface IDispatchedStep1Values {
  globalFormValues: Step1FinalGlobalFormValues;
  globalServerValues: Step1FinalGlobalServerValues;
}

export const dispatchStep1Values = async (
  formValues: Step1InitFormValues,
  selectedPurchasePlan: any,
  selectedPurchasePlanPosition: any
): IDispatchedStep1Values => {
  const isViaPlan = formValues.is_via_plan === "true";

  let procedureMethod = null;
  const planPositionId = formValues.purchase_method_id || null;
  if (isViaPlan) {
    const planId = selectedPurchasePlan.id;
    const planPosition = await fetchPurchasePlanPosition({
      planId,
      planPositionId,
    });

    procedureMethod = planPosition.procedure_system_type;
    const purchaseMethodEisCode = planPosition.purchase_method_code;
    if (!procedureMethod) {
      sendToast(
        "error",
        `Не найдено сопоставление по выбранной позиции плана. Код: ${purchaseMethodEisCode}`
      );
      return { "": "" };
    }
  }
  const requirementRNPOption = formValues.options.includes(
    "rnp_requirement_option"
  );
  const smbOption = formValues.options.includes("smb_participant_option");
  const subcontractorOption = formValues.options.includes(
    "subcontractor_option"
  );
  return {
    globalFormValues: {
      is_for_smb: smbOption,
      is_subcontractor_requirement: subcontractorOption,
      requirement_not_rnp: requirementRNPOption,
      name: formValues.procedure_title,
      plan_position_id: isViaPlan ? planPositionId : null,
      platform: formValues.procedure_section,
    },
    globalServerValues: {
      isViaPlan,
      purchasePlanId: isViaPlan ? formValues.purchase_plan_id : null,
      purchasePlanNumber: isViaPlan
        ? (selectedPurchasePlan?.registration_number as string)
        : null,
      planPositionNumber: isViaPlan
        ? (selectedPurchasePlanPosition?.number as number)
        : null,
      procedureMethod: isViaPlan
        ? procedureMethod
        : formValues.procedure_method,
    },
  };
};
