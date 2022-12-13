import React, { createContext } from "react";
import { ProcedureFormActionVariants } from "../../pages/ProcedureForm";
import { IAuthSession } from "../../types/auth";
import { IProcedure } from "../../types/procedure";

export interface IMultiStepForm {
  serverData: {
    procedure?: IProcedure;
    session?: IAuthSession;
    purchasePlan?: any;
    isViaPlan?: boolean;
    purchasePlanId?: string;
    actionType?: ProcedureFormActionVariants;
    options?: {
      bidding_per_position_option?: boolean;
      bidding_per_unit_option?: boolean;
      reduction_ratio_option?: boolean;
      protocols_count_more_option?: boolean;
    };
  };
  formValues: object;
  formErrors: object;
}

export interface IMultiStepFormContext {
  formValues: IMultiStepForm["formValues"];
  setFormValues: React.Dispatch<
    React.Dispatch<React.SetStateAction<IMultiStepForm["formValues"]>>
  >;

  formErrors: IMultiStepForm["formErrors"];
  setFormErrors: React.Dispatch<
    React.Dispatch<React.SetStateAction<IMultiStepForm["formErrors"]>>
  >;

  serverData: IMultiStepForm["serverData"];
  setServerData: React.Dispatch<
    React.Dispatch<React.SetStateAction<IMultiStepForm["serverData"]>>
  >;
  currentStepId: number;
  setCurrentStepId: React.Dispatch<React.SetStateAction<number>>;
}

const MultiStepFormContext = createContext(
  null as unknown as IMultiStepFormContext
);

export default MultiStepFormContext;
