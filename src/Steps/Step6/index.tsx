import {
  Form,
  Button,
  CheckboxGroup,
  RadioGroup,
  Checkbox,
  Radio,
  Schema,
  CheckPicker,
  InputNumber,
  Panel,
  Slider,
  DatePicker,
  Message,
  toaster,
  FlexboxGrid,
  Input,
  Animation,
  SelectPicker,
  Header,
  Stack,
  InputGroup,
  Uploader,
} from "rsuite";
import "../../../public/new_cryptopro/signlib";
import React, { useEffect, useState } from "react";
import PurchasePlanTable from "../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import MaskedInput from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import fetchPurchasePlans from "../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../services/api/fetchPurchasePlan";
import fetchSession from "../../services/api/fetchSession";
import toBase64 from "../../utils/toBase64";
import axios from "axios";

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

  // const purchasePlanQuery = useQuery(
  //   ["purchasePlan", formValue.purchase_plan_id, isViaPlan],
  //   () =>
  //     formValue.purchase_plan_id.trim().length &&
  //     fetchPurchasePlan(formValue.purchase_plan_id)
  // );

  const [selectedPlanPositions, setSelectedPlanPositions] = useState([]);

  const handleSubmit = () => {
    onNext();
    // if (!formRef.current.check()) {
    //   toaster.push(<Message type="error">Error</Message>);
    //   return;
    // }
    // toaster.push(<Message type="success">Success</Message>);
  };

  return (
    <div className="col-md-8">
      <Form
        ref={formRef}
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        model={model}
      >
        <MaskedInput mask={currencyMask} />
        <Panel header="Документы процедуры">
          <Uploader
            action=""
            autoUpload={false}
            onUpload={(event) => {
              console.log("on uploadddd", event);
            }}
            // onProgress={(event) => console.log("on progress", event)}
            onChange={async (files) => {
              console.log("on changeee", files);
              const formData = new FormData();
              const filesToServer = await Promise.all(
                files.map(async (file, number) => {
                  const base64content = await toBase64(file.blobFile);
                  // formData.append(number.toString());
                  // return {
                  //   file,
                  //   base64content,
                  // };
                  var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;
                  var CADESCOM_BASE64_TO_BINARY = 1;
                  window.cadesplugin.async_spawn(function* (args) {
                    // Создаем объект CAdESCOM.HashedData
                    var oHashedData = yield cadesplugin.CreateObjectAsync(
                      "CAdESCOM.HashedData"
                    );

                    // Алгоритм хэширования нужно указать до того, как будут переданы данные
                    yield oHashedData.propset_Algorithm(
                      CADESCOM_HASH_ALGORITHM_CP_GOST_3411
                    );

                    // Указываем кодировку данных
                    // Кодировка должна быть указана до того, как будут переданы сами данные
                    yield oHashedData.propset_DataEncoding(
                      CADESCOM_BASE64_TO_BINARY
                    );

                    // Предварительно закодированные в BASE64 бинарные данные
                    // В данном случае закодирован файл со строкой "Some Data."
                    var dataInBase64 = toBase64(file.blobFile);

                    // Передаем данные
                    yield oHashedData.Hash(dataInBase64);

                    // Получаем хэш-значение
                    var sHashValue = yield oHashedData.Value;
                    // Это значение будет совпадать с вычисленным при помощи, например,
                    // утилиты cryptcp от тех же исходных _бинарных_ данных.
                    // В данном случае - от файла со строкой "Some Data."
                    console.log("hashhhhhhh", sHashValue);
                    // document.getElementById("hashVal").innerHTML = sHashValue;
                  });
                  // window.signlib
                  //   .hashFile(file.blobFile)
                  //   .then((res) => console.log("resss", res))
                  //   .catch((err) => console.log("errr", err));
                })
              );
              // console.log("uploaddedd", formData);
              // await axios.post("http://223.etpp.loc/hash", {
              //   headers: {
              //     "Content-Type": `multipart/form-data`,
              //   },
              //   // withCredentials: true,
              //   data: formData,
              // });
            }}
            // action="//jsonplaceholder.typicode.com/posts/"
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
            Далее
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step6;
