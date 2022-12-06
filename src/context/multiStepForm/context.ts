import React, { createContext } from "react";
import { IAuthSession } from "../../types/auth";
import { IProcedure } from "../../types/procedure";

export interface IMultiStepForm {
  serverData: {
    procedure?: IProcedure;
    session?: IAuthSession;
    purchasePlan?: any;
    isViaPlan?: boolean;
    purchasePlanId?: string;
  };
  formValues: object;
  formErrors: object;
}

export interface IMultiStepFormContext {
  formValues: IMultiStepForm["formValues"];
  setFormValues: React.Dispatch<
    React.SetStateAction<IMultiStepForm["formValues"]>
  >;

  formErrors: IMultiStepForm["formErrors"];
  setFormErrors: React.Dispatch<
    React.SetStateAction<IMultiStepForm["formErrors"]>
  >;

  serverData: IMultiStepForm["serverData"];
  setServerData: React.Dispatch<
    React.SetStateAction<IMultiStepForm["serverData"]>
  >;
}

const MultiStepFormContext = createContext(
  null as unknown as IMultiStepFormContext
);

export default MultiStepFormContext;
