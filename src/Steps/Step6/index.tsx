import { Form, Button, Schema, Panel, Uploader, Table, Header } from "rsuite";
import $ from "jquery";
import "../../../public/new_cryptopro/signlib";
import React, { useContext, useEffect, useState } from "react";
import PurchasePlanTable from "../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import MaskedInput from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import fetchPurchasePlans from "../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../services/api/fetchPurchasePlan";
import fetchSession from "../../services/api/fetchSession";
import toBase64 from "../../utils/toBase64";
import axios from "axios";
import MultiStepFormContext from "../../context/multiStepForm/context";
import uploadNoticeDocuments from "../../services/api/uploadNoticeDocuments";
import { API_V1_URL } from "../../services/api";

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

const Step6 = ({ onNext, onPrevious }) => {
  const [documents, setDocuments] = useState([]);
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  console.log("procedureeee", formGlobalValues);

  const currencyMask = createNumberMask({
    prefix: "",
    suffix: "RUB",
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: " ",
    allowDecimal: true,
    decimalSymbol: ".",
    decimalLimit: 2, // how many digits allowed after the decimal
    // integerLimit: 7, // limit length of integer numbers
    allowNegative: false,
    allowLeadingZeroes: false,
    requireDecimal: true,
  });

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    lot_start_price: "",
    lot_title: "",
    lot_currency: "RUB",
    nds_type: "NO_NDS",
  });

  const isViaPlan = formValue.is_via_plan === "true";

  const sessionQuery = useQuery("session", fetchSession);

  const noticeId = formGlobalServerData.noticeId;

  // const purchasePlanQuery = useQuery(
  //   ["purchasePlan", formValue.purchase_plan_id, isViaPlan],
  //   () =>
  //     formValue.purchase_plan_id.trim().length &&
  //     fetchPurchasePlan(formValue.purchase_plan_id)
  // );

  const signDocument = () => {};

  const handleSubmit = () => {
    onNext();
    // if (!formRef.current.check()) {
    //   toaster.push(<Message type="error">Error</Message>);
    //   return;
    // }
    // toaster.push(<Message type="success">Success</Message>);
  };

  const { Column, HeaderCell, Cell } = Table;

  return (
    <div className="col-md-8">
      <Form
        ref={formRef}
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        model={model}
      >
        <Panel header="Документы процедуры">
          <table className="table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr>
                  <td>{doc.file_real_name}</td>
                  <td>
                    {doc.status === "STATUS_NEW" ? (
                      <Button appearance="primary" color="green">
                        Подписать
                      </Button>
                    ) : (
                      doc.status_localized
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* <Table data={documents}>
            {Object.keys(documents).map((key) => (
              <Column>
                <HeaderCell>Наименование</HeaderCell>
                <Cell dataKey={key} />
              </Column>

              //    <Column width={200}>
              //   <HeaderCell>Наименование</HeaderCell>
              //   <Cell dataKey="file_real_name" />
              // </Column>

              // <Column width={120}>
              //   <HeaderCell>Статус</HeaderCell>
              //   <Cell dataKey="status_localized"></Cell>
              // </Column>
            ))}
          </Table> */}
          <Uploader
            action={`${API_V1_URL}/notice/fcc5bf8d-aadf-4715-a155-303ed3d84b23/document/upload`}
            // action={`${API_V1_URL}/notice/${noticeId}/document/upload`}
            autoUpload={false}
            onUpload={(event) => {
              console.log("on uploadddd", event);
            }}
            // onProgress={(event) => console.log("on progress", event)}
            onChange={async (files) => {
              console.log("on changeee", files);
              const formData = new FormData();
              formData.append("files[]", files[0].blobFile);
              $.ajax({
                url: `${API_V1_URL}/notice/fcc5bf8d-aadf-4715-a155-303ed3d84b23/document/upload`,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                method: "POST",
                xhrFields: {
                  withCredentials: true,
                },
                success: (response) => {
                  console.log("resss", response);
                  setDocuments((state) => [...state, ...response.files]);
                },
              });
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
          <Button onClick={onPrevious}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Предпросмотр процедуры
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step6;
