import axios from "axios";
import { API_V1_URL } from ".";

const API_URL = API_V1_URL;

const fetchPurchasePlans = async (profileId: string) => {
  const form = new FormData();
  const { data } = await axios.get(`${API_URL}/purchase/plans`, {
    data: form,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
    },
    withCredentials: true,
  });
  return data.data;
};

export default fetchPurchasePlans;
