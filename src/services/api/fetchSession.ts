import axios from "axios";

const fetchSession = async () => {
  const { data } = await axios.get("http://localhost:8002/api/auth/session");
  return data.session;
};

export default fetchSession;
