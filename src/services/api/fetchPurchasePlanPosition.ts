import axios from "axios";
import { API_V1_URL } from ".";

export interface FetchPurchasePlanPositionPayload {
  planId: string;
  planPositionId: string;
}

const fetchPurchasePlanPosition = async (
  payload: FetchPurchasePlanPositionPayload
) => {
  const { planId, planPositionId } = payload;
  const { data } = await axios.get(
    `${API_V1_URL}/purchase/plan/${planId}/position/${planPositionId}/get`
  );
  return data.data;
};

export default fetchPurchasePlanPosition;
