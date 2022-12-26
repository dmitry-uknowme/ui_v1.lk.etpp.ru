import axios from "axios";
import { DATA_URL } from ".";

const fetchOkvedCodes = async (searchStr?: string) => {
  const { data } = await axios.get(
    `${DATA_URL}/api/okved2s.json${
      searchStr?.trim()?.length ? `?name=${searchStr}` : ""
    }`
  );
  return data;
};

export default fetchOkvedCodes;
