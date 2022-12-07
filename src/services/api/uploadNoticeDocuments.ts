import { API_V1_URL } from ".";

interface UploadNoticeDocumentsPayload {
  noticeId: string;
  documents: File[];
}

const uploadNoticeDocuments = async (
  payload: UploadNoticeDocumentsPayload,
  onError: (...args: any) => any
) => {
  const { noticeId, documents } = payload;
  const formData = new FormData();
  formData.append("files[]", documents);
  try {
    const procedureResponse = await fetch(
      `${API_V1_URL}/notice/${noticeId}/document/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data; boundary=CUSTOM",
        },
        credentials: "include",
      }
    );
    return procedureResponse.json((res) => res.files);
  } catch (err) {
    return onError(err);
  }
};

export default uploadNoticeDocuments;
