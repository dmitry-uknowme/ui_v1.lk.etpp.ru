import axios from "axios";
import { API_URL } from ".";

const fetchSession = async () => {
  const { data } = await axios.get(`${API_URL}/auth/session`, {
    withCredentials: true,
  });
  return data.session;
};

export default fetchSession;
