import axios from "axios";
import { DATA_URL } from ".";

const fetchRegions = async () => {
  const { data } = await axios.get(`${DATA_URL}/api/regions.json`);
  return data;
};

export default fetchRegions;
