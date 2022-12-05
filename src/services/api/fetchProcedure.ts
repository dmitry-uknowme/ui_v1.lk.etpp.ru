import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/";

const fetchProcedure = async () => {
  await axios.get(`${API_URL}/procedure`);
};

export default fetchProcedure;
