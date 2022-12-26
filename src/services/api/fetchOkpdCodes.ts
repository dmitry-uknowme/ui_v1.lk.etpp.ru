import axios from "axios";
import { DATA_URL } from ".";

const fetchOkpdCodes = async (searchStr?: string) => {
  const { data } = await axios.get(
    `${DATA_URL}/api/okpd2s.json${
      searchStr?.trim()?.length ? `?name=${searchStr}` : ""
    }`
  );
  return data;
};

export default fetchOkpdCodes;
