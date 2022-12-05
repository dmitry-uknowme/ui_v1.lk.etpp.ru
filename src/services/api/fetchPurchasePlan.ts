import axios from "axios";
import { API_V1_URL } from ".";

const API_URL = API_V1_URL;

export interface IPurchasePlan {
  positions: IPurchasePlanPosition[];
}
export interface IPurchasePlanPosition {
  number: string;
  contract_subject: string;
  maximum_contract_price?: string;
  purchase_planned_date: string;
  section_item: string;
}

const fetchPurchasePlan = async (planId: string) => {
  const form = new FormData();
  const { data } = await axios.get(`${API_URL}/purchase/plans/${planId}/get`, {
    data: form,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
    },
    withCredentials: true,
  });
  return data.data as IPurchasePlan;
};

export default fetchPurchasePlan;
