import axios from "axios";
import { API_V1_URL } from ".";

export interface ISignedDocument {
  id: string;
  sign: string;
}

interface SendSignedDocumentsPayload {
  documents: ISignedDocument[];
}

const sendSignedDocuments = async (
  payload: SendSignedDocumentsPayload,
  onError?: (...args: any) => any
) => {
  const { documents } = payload;
  try {
    const { data } = await axios.post(
      `${API_V1_URL}/notice/documents/sign`,
      documents,
      { withCredentials: true }
    );
    return data;
  } catch (err) {
    return onError(err);
  }
};

export default sendSignedDocuments;
