import axios from "axios";
import { API_V1_URL } from ".";

const API_URL = API_V1_URL;

const fetchProcedure = async () => {
  await axios.get(`${API_URL}/procedure`);
};

export default fetchProcedure;
