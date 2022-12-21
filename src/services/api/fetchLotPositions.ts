import axios from "axios";
import { API_V1_URL } from ".";

interface FetchLotPositionsPayload {
  lotId: string;
}

const fetchLotPositions = async (payload: FetchLotPositionsPayload) => {
  const { lotId } = payload;
  const { data } = await axios.get(`${API_V1_URL}/lots/${lotId}/positions`);
  return data.data;
};

export default fetchLotPositions;
