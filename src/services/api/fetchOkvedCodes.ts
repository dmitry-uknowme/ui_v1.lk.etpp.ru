import axios from "axios";
import { DATA_URL } from ".";

const fetchOkvedCodes = async () => {
  const { data } = await axios.get(`${DATA_URL}/api/okved2s.json`);
  return data;
};

export default fetchOkvedCodes;
