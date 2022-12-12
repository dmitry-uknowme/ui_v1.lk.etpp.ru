import axios from "axios";
import { API_V1_URL } from ".";

const fetchOrganizationEmployee = async (profileId: string) => {
  try {
    const { data } = await axios.get(
      `${API_V1_URL}/user/profile/organization/employees/${profileId}/get`
    );
    return data.data;
  } catch (err) {
    console.log("errrr", err);
  }
};

export default fetchOrganizationEmployee;
