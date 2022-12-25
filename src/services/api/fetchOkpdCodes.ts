import axios from "axios";
import { DATA_URL } from ".";

const fetchOkpdCodes = async () => {
  const { data } = await axios.get(`${DATA_URL}/api/okpd2s.json`);
  return data;
};

export default fetchOkpdCodes;
