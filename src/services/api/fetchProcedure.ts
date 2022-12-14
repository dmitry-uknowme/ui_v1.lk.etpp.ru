import axios from "axios";
import { API_V1_URL } from ".";

const API_URL = API_V1_URL;

interface FetchProcedurePayload {
  procedureId: string;
}

const fetchProcedure = async (
  payload: FetchProcedurePayload,
  onError?: (...args: any) => any
) => {
  const { procedureId } = payload;
  try {
    const { data } = await axios.get(`${API_URL}/procedures/${procedureId}`);
    return data;
  } catch (err) {
    onError(err);
  }
};

export default fetchProcedure;
