import axios from "axios";
import { API_V1_URL } from ".";

const fetchLotPositionUnits = async () => {
  const { data } = await axios.get(
    `${API_V1_URL}/procedure/lot/position/units`
  );
  const items = data?.paginator?.items;
  if (items?.length) {
    return items;
  }
};

export default fetchLotPositionUnits;
