import { API_V1_URL } from ".";

// interface CreateProcedurePayload {}

const createProcedure = async (
  payload: any,
  onError: (...args: any) => any
) => {
  try {
    const procedureResponse = await fetch(
      `${API_V1_URL}/procedures/COMPETITIVE_SELECTION`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    return procedureResponse.json((res) => res.procedure);
  } catch (err) {
    return onError(err);
  }
};

export default createProcedure;
