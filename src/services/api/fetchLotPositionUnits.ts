import axios from "axios";
import { API_V1_URL } from ".";

const fetchLotPositionUnits = async (searchStr?: string) => {
  const { data } = await axios.get(
    `${API_V1_URL}/procedure/lot/position/units${
      searchStr?.trim()?.length ? `?code=${searchStr}` : ""
    }`
  );
  const items = data?.paginator?.items;
  if (items?.length) {
    return items;
  }
};

export default fetchLotPositionUnits;
