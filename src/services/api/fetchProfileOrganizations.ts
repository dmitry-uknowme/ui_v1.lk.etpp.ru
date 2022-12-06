import axios from "axios";
import { API_V1_URL } from ".";

export interface FetchProfileOrganizationsPayload {
  profileId: string;
}

const fetchProfileOrganizations = async (
  payload: FetchProfileOrganizationsPayload,
  onError?: (...args: any) => any
) => {
  try {
    const { data } = await axios.get(
      `${API_V1_URL}/user/profile/organization/${payload.profileId}/get`
    );
    return data.data;
  } catch (err) {
    return onError(err);
  }
};

export default fetchProfileOrganizations;
