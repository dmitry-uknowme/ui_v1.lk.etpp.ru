import axios from "axios";
import { IProcedure } from "../../types/procedure";

export interface CreateProcedureViaPurchasePlanPayload {
  profileId: string;
  planPositionId: string;
}

const createProcedureViaPurchasePlan = async (
  payload: CreateProcedureViaPurchasePlanPayload,
  onError: (...args: any) => any
) => {
  try {
    const { data } = await axios.post(
      `http://localhost:8000/api/v1/procedures/create`,
      { ...payload }
      // { data: { profileId, planPositionId }, withCredentials: true }
    );
    // if ()
    return data.procedure as IProcedure;
  } catch (err) {
    onError(err);
  }
};

export default createProcedureViaPurchasePlan;
