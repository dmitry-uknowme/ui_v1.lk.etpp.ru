import axios from "axios";
import { API_V1_URL } from ".";

interface FetchNoticeDocumentsPayload {
  noticeId: string;
}

const fetchNoticeDocuments = async (
  payload: FetchNoticeDocumentsPayload,
  onError: (...args: any) => any
) => {
  const { noticeId } = payload;
  try {
    const { data } = await axios.get(
      `${API_V1_URL}/notice/${noticeId}/documents`,
      {
        headers: {
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );

    return data.files;
  } catch (err) {
    return onError(err);
  }
};

export default fetchNoticeDocuments;
