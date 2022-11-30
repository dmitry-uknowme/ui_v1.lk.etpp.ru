import axios from "axios";

const fetchSession = async () => {
  const { data } = await axios.get("http://localhost:8001/api/auth/session", {
    withCredentials: true,
  });
  return data.session;
};

export default fetchSession;
