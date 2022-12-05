import axios from "axios";
import { API_V1_URL } from ".";
import { IProcedure } from "../../types/procedure";

export interface CreateProcedureViaPurchasePlanPayload {
  profileId: string;
  planPositionId: string;
}

const API_URL = API_V1_URL;

const createProcedureViaPurchasePlan = async (
  payload: CreateProcedureViaPurchasePlanPayload,
  onError: (...args: any) => any
) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/procedures/create`,
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
