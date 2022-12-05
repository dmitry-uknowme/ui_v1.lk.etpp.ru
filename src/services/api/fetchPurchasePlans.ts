import axios from "axios";

const fetchPurchasePlans = async (profileId: string) => {
  const form = new FormData();
  const { data } = await axios.get(
    "http://localhost:8000/api/v1/purchase/plans",
    {
      data: form,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
      },
      withCredentials: true,
    }
  );
  return data.data;
};

export default fetchPurchasePlans;
