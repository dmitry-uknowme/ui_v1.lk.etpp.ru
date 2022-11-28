import axios from "axios";

const fetchPurchasePlan = async (planId: string) => {
  const form = new FormData();
  const { data } = await axios.get(
    `http://localhost:8002/api/v1/purchase/plans/${planId}/get`,
    {
      data: form,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
      },
      // withCredentials: true,
    }
  );
  return data.data;
};

export default fetchPurchasePlan;
