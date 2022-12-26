import axios from "axios";
import { API_V1_URL } from ".";

// interface CreateProcedurePayload {}

const updateProcedure = async (
  procedureId: string,
  payload: any,
  onError: (...args: any) => any
) => {
  try {
    const { data } = await axios.put(
      `${API_V1_URL}/procedure/${procedureId}`,
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    // const procedureResponse = await fetch(
    //   `${API_V1_URL}/procedures/COMPETITIVE_SELECTION`,
    //   {
    //     method: "POST",
    //     body: JSON.stringify(payload),
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //   }
    // );
    // console.log("procres", procedureResponse);
    // if (procedureResponse.status !== 200 || procedureResponse.status !== 201) {
    //   return onError(procedureResponse);
    // }
    return data;
  } catch (err) {
    console.log("procedure eerrrrrrr", err);
    if (err.response.status === 400) {
      return onError(err.response.data.errors);
    }

    return onError(err);
  }
};

export default updateProcedure;
