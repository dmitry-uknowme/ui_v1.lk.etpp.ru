import axios from "axios";
import { API_V1_URL } from ".";

interface UpdateLotPositionPayload {
  info?: string;
  amount?: string;
  region_address?: string;
}

const updateLotPosition = async (
  positionId: string,
  payload: UpdateLotPositionPayload
) => {
  const { data } = await axios.patch(
    `${API_V1_URL}/procedure/lot/position/${positionId}`,
    payload
  );
};

export default updateLotPosition;
