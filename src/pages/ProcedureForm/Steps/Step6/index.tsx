import {
  Form,
  Button,
  Schema,
  Panel,
  Uploader,
  Table,
  Header,
  toaster,
  Message,
  Badge,
  IconButton,
  Checkbox,
  ButtonToolbar,
} from "rsuite";
import $ from "jquery";

import React, { useContext, useEffect, useRef, useState } from "react";
import CloseIcon from "@rsuite/icons/Close";
import TrashIcon from "@rsuite/icons/Trash";
import { useQuery } from "react-query";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import fetchSession from "../../../../services/api/fetchSession";
import toBase64 from "../../../../utils/toBase64";
import axios from "axios";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import uploadNoticeDocuments from "../../../../services/api/uploadNoticeDocuments";
import { API_V1_URL, LK_URL } from "../../../../services/api";
import fetchNoticeDocuments from "../../../../services/api/fetchNoticeDocuments";
import sendSignedDocuments from "../../../../services/api/sendSignedDocument";
import sendToast from "../../../../utils/sendToast";

const Field = React.forwardRef((props, ref) => {
  const { name, message, label, accepter, error, ...rest } = props;
  return (
    <Form.Group
      controlId={`${name}-10`}
      ref={ref}
      className={error ? "has-error" : ""}
    >
      <Form.ControlLabel>{label} </Form.ControlLabel>
      <Form.Control
        name={name}
        accepter={accepter}
        errorMessage={error}
        {...rest}
      />
      <Form.HelpText>{message}</Form.HelpText>
    </Form.Group>
  );
});

const { ArrayType, NumberType, StringType } = Schema.Types;
const model = Schema.Model({
  is_via_plan: StringType().isRequired("Поле обязательно для заполнения"),
  procedure_title: StringType().isRequired("Поле обязательно для заполнения"),
});

const Step6 = ({ currentStep, setCurrentStep, nextStep, prevStep }) => {
  const uploaderRer = useRef();
  const [fileList, setFileList] = useState([]);
  const [isBtnLoader, setBtnLoader] = useState<boolean>(false);
  const [isRemoveLoader, setRemoveLoader] = useState<boolean>(false);
  const [isSignLoader, setSignLoader] = useState<boolean>(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const procedureId = formGlobalServerData?.procedureId;
  // const procedure = formGlobalServerData?.procedure || formGlobalServerData?.procedureId;
  const cert_thumbprint = formGlobalServerData.session?.cert_thumbprint;
  if (!procedureId) {
    sendToast("error", "Извещение не создано")
    // toaster.push(<Message type="error">Извещение не создано</Message>);
    return prevStep();
  }

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    lot_start_price: "",
    lot_title: "",
    lot_currency: "RUB",
    nds_type: "NO_NDS",
  });

  const noticeId = formGlobalServerData.noticeId;



  const initDocuments = async () => {
    const serverDocuments = await fetchNoticeDocuments({ noticeId });
    setDocuments(serverDocuments);
  };

  const signDocument = async (document) => {
    const signlib = window.signlib;
    try {
      const signData = await signlib.signStringHash(
        document.file_hash,
        cert_thumbprint
      );
      await sendSignedDocuments({
        documents: [{ id: document.id, sign: signData.sign }],
      });
      setDocuments((state) => [
        ...state.map((doc) =>
          doc.id === document.id
            ? { ...doc, status_localized: "Подписан", status: "STATUS_SIGNED" }
            : doc
        ),
      ]);

      sendToast("success", "Документ успешно подписан")      // return toaster.push(
      //   <Message type="success">Документ успешно подписан</Message>
      // );
    } catch (err) {
      sendToast("error", `Ошибка при подписании документа ${JSON.stringify(err)}`)
      // return toaster.push(
      //   <Message type="error">
      //     Ошибка при подписании документа {JSON.stringify(err)}
      //   </Message>
      // );
    }
  };

  const removeDocument = async (document) => {
    const documentId = document.id;

    try {
      const { data } = await axios.get(
        `${LK_URL}/notice/document/${documentId}/delete`,
        { withCredentials: true }
      );
      setDocuments((state) => state.filter((doc) => doc.id !== documentId));
    } catch (err) {
      sendToast("error", "Ошибка при удалении документа")
      // toaster.push(
      //   <Message type="error">Ошибка при удалении документа</Message>
      // );
    }
  };
  // const allDocumentsSigned = !!documents.filter(
  //   (doc) => doc.status !== "STATUS_SIGNED"
  // );

  const handleSubmit = () => {
    const isDocumentsExists = documents?.length;
    const isAllDocumentsSigned =
      documents.filter((doc) => doc.status === "STATUS_SIGNED").length ===
      documents.length;
    if (!isDocumentsExists) {
      sendToast("error", "Не загружен документ извещения")
      return
      // return toaster.push(
      //   <Message type="error">Не загружен документ извещения</Message>
      // );
    }

    if (!isAllDocumentsSigned) {
      sendToast("error", "Подписаны не все документы извещения")
      return
      // return toaster.push(
      //   <Message type="error">Подписаны не все документы извещения</Message>
      // );
    }

    nextStep();
    // if (!formRef.current.check()) {
    //   toaster.push(<Message type="error">Error</Message>);
    //   return;
    // }
    // toaster.push(<Message type="success">Success</Message>);
  };

  const { Column, HeaderCell, Cell } = Table;

  useEffect(() => {
    initDocuments();
  }, []);

  return (
    <div className="col-md-9">
      <Form
        ref={formRef}
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        model={model}
      >
        <Panel header="Документы извещения">
          {documents?.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <Checkbox
                      indeterminate={
                        selectedDocuments.length !== documents.length &&
                        selectedDocuments.length
                      }
                      checked={selectedDocuments.length === documents.length}
                      onChange={(value, checked) =>
                        checked
                          ? setSelectedDocuments(documents)
                          : setSelectedDocuments([])
                      }
                    />
                  </th>
                  <th>Наименование</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {documents?.length
                  ? documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <Checkbox
                          value={doc.id}
                          checked={
                            !!selectedDocuments.find((d) => d.id === doc.id)
                          }
                          // checked={
                          //   !!selectedDocuments.find((d) => d.id === doc.id)
                          // }
                          onChange={(value) => {
                            const currentDocument = documents.find(
                              (d) => d.id === value
                            );
                            const isChecked = !!selectedDocuments.find(
                              (doc) => currentDocument.id === doc.id
                            );

                            if (isChecked) {
                              setSelectedDocuments((state) => [
                                ...state.filter(
                                  (d) => d.id !== currentDocument.id
                                ),
                              ]);
                            } else {
                              setSelectedDocuments((state) => [
                                ...state,
                                currentDocument,
                              ]);
                            }
                          }}
                        />
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        {doc.file_real_name}
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        {doc.status === "STATUS_NEW" ? (
                          <Button
                            appearance="primary"
                            color="blue"
                            size="xs"
                            onClick={() => signDocument(doc)}
                            loading={doc?.isLoading}
                          >
                            Подписать
                          </Button>
                        ) : (
                          <Badge
                            color="green"
                            content={doc.status_localized}
                          />
                        )}
                      </td>
                      <td
                        onClick={() => removeDocument(doc)}
                        style={{ verticalAlign: "middle" }}
                      >
                        <IconButton
                          size="sm"
                          color="red"
                          appearance="subtle"
                          onClick={() => removeDocument(doc)}
                          // appearance="subtle"
                          icon={
                            <TrashIcon
                              color="red"
                              onClick={() => removeDocument(doc)}
                            />
                          }
                        >
                          Удалить
                        </IconButton>
                      </td>
                    </tr>
                  ))
                  : null}
              </tbody>
            </table>
          ) : null}
          {selectedDocuments?.length || documents?.length ? (
            <ButtonToolbar>
              <Button
                appearance="ghost"
                color="blue"
                onClick={async () => {
                  try {
                    await Promise.all(
                      selectedDocuments.map((doc) => signDocument(doc))
                    );
                  } catch (err) {
                    sendToast("error", "Ошибка при подписании документов")
                    // toaster.push(
                    //   <Message type="error">
                    //     Ошибка при подписании документов
                    //   </Message>
                    // );
                    // toaster.push(
                    //   <Message type="error">
                    //     Ошибка при подписании документов
                    //   </Message>
                    // );
                  } finally {
                    setSignLoader(false);
                  }
                }}
                loading={isSignLoader}
                disabled={!selectedDocuments.length}
              >
                Подписать выделенные
              </Button>
              <IconButton
                size="sm"
                color="red"
                appearance="ghost"
                onClick={async () => {
                  try {
                    await Promise.all(
                      selectedDocuments.map((doc) => removeDocument(doc))
                    );
                  } catch (err) {
                    sendToast("error", "Ошибка при удалении документов")
                    // toaster.push(
                    //   <Message type="error">
                    //     Ошибка при удалении документов
                    //   </Message>
                    // );
                  } finally {
                    setRemoveLoader(false);
                  }
                }}
                loading={isRemoveLoader}
                disabled={!selectedDocuments.length}
                icon={<TrashIcon color="red" />}
              >
                Удалить выделенные
              </IconButton>
            </ButtonToolbar>
          ) : null}
          <div className="mt-3"></div>
          <Uploader
            fileList={fileList}
            ref={uploaderRer}
            renderThumbnail={() => null}
            renderFileInfo={() => null}
            fileListVisible={false}
            action={`${API_V1_URL}/notice/${noticeId}/document/upload`}
            autoUpload={false}
            onUpload={(event) => {
              console.log("on uploadddd", event);
            }}
            onChange={async (files) => {
              console.log("on changeee", files);
              const formData = new FormData();
              files.map((file) => formData.append("files[]", file.blobFile));
              try {
                const { data } = await axios.post(
                  `${API_V1_URL}/notice/${noticeId}/document/upload`,
                  formData,
                  {
                    withCredentials: true,
                    onUploadProgress: (progressEvent) => {
                      // console.log("progresss", progressEvent);
                      const totalLength = progressEvent?.total
                        ? progressEvent.total
                        : progressEvent?.event.target.getResponseHeader(
                          "content-length"
                        ) ||
                        progressEvent?.target.getResponseHeader(
                          "x-decompressed-content-length"
                        );
                      console.log(
                        "progressss value",
                        Math.round((progressEvent.loaded * 100) / totalLength)
                      );
                    },
                  }
                );

                setDocuments(data.files);
                setFileList([]);
              } catch (err) {
                sendToast("error", "Ошибка при загрузке документа")
                return
                // return toaster.push(
                //   <Message type="error">Ошибка при загрузке документа</Message>
                // );
              }
            }}
            draggable
            multiple
          >
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>
                Кликните или перетащите документы на эту область для загрузки
              </span>
            </div>
          </Uploader>
        </Panel>

        <Form.Group>
          <Button onClick={prevStep}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Предпросмотр извещения
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step6;
