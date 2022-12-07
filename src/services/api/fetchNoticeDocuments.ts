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
    const documentsResponse = await fetch(
      `${API_V1_URL}/notice/${noticeId}/documents`,
      {
        method:"GET,
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      }
    );
    return documentsResponse.json((res) => res.files);
  } catch (err) {
    return onError(err);
  }
};

export default fetchNoticeDocuments;
