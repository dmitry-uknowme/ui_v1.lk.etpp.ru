import axios from "axios";
import { API_V1_URL } from ".";

interface UpdateLotPositionPayload {
  amount: string;
  unit_price: string;
  region_address: string;
  unit_value: string;
  okpd_code: string;
  okpd_name: string;
  okved_code: string;
  okved_name: string;
  qty: number;
}

const updateLotPosition = async (
  positionId: string,
  payload: UpdateLotPositionPayload
) => {
  const { data } = await axios.patch(
    `${API_V1_URL}/procedure/lot/position/${positionId}`,
    payload,
    { withCredentials: true }
  );
};

export default updateLotPosition;
