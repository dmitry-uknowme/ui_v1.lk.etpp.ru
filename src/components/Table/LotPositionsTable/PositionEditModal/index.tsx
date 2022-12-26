import currency from "currency.js";
import React, { useContext, useEffect, useState } from "react";
import { QueryClient, useQuery, useQueryClient } from "react-query";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Modal,
  Schema,
  SelectPicker,
  toaster,
} from "rsuite";
import { v4 as uuidv4 } from "uuid";
import CurrencyInput from "react-currency-masked-input";
import fetchRegions from "../../../../services/api/fetchRegions";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import { ProcedureFormActionVariants } from "../../../../pages/ProcedureForm";
import updateLotPosition from "../../../../services/api/updateLotPosition";
import sendToast from "../../../../utils/sendToast";
import PositionUnitPicker from "../../../SelectPicker/PositionUnitPicker";
import PositionTypePicker from "../../../SelectPicker/PositionTypePicker";
import OkpdCodePicker from "../../../SelectPicker/OkpdCodePicker";
import OkvedCodePicker from "../../../SelectPicker/OkvedCodePicker";

interface PositionEditModalProps {
  position: ILotPosition;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

export interface ILotPosition {
  id: string;
  number: string;
  name?: string;
  item_id: string;
  okato: string;
  okpd_code: string;
  okpd_name: string;
  okpd_field?: string;
  okved_code: string;
  okved_name: string;
  okved_field?: string;
  qty?: string;
  qty_count?: string;
  region_name?: string;
  region_okato?: string;
  type_item?: string;
  unit_code?: string;
  unit_name?: string;
  unit_amount?: string;
  amount?: string;
  address?: string;
  extra_info?: string;
}

const Field = React.forwardRef((props, ref) => {
  const { name, message, label, accepter, error, ...rest } = props;
  return (
    <Form.Group
      controlId={`${name}-10`}
      ref={ref}
      className={error ? "has-error" : ""}
    >
      <Form.ControlLabel>{label} </Form.ControlLabel>
      {rest.as === "textarea" ? (
        <>
          <Input as="textarea" name={name} {...rest} />
          {error ? (
            <span className="rs-form-error-message rs-form-error-message-show">
              <span className="rs-form-error-message-arrow"></span>
              <span className="rs-form-error-message-inner">{error}</span>
            </span>
          ) : null}
        </>
      ) : (
        <Form.Control
          name={name}
          accepter={accepter}
          errorMessage={error}
          {...rest}
        />
      )}

      <Form.HelpText>{message}</Form.HelpText>
    </Form.Group>
  );
});

const { ArrayType, NumberType, StringType } = Schema.Types;
const model = Schema.Model({
  // unit_amount: NumberType("Поле должно быть числом").isRequired(
  //   "Поле обязательно для заполнения"
  // ),
  // amount: NumberType("Поле должно быть числом").isRequired(
  //   "Поле обязательно для заполнения"
  // ),
  // region_okato: StringType().isRequired("Поле обязательно для заполнения"),
  address: StringType().isRequired("Поле обязательно для заполнения"),
  name: StringType().isRequired("Поле обязательно для заполнения"),
});
const modelAddType = Schema.Model({
  type_item: StringType().isRequired("Поле обязательно для заполнения"),
  okpd_code: StringType().isRequired("Поле обязательно для заполнения"),
  okved_code: StringType().isRequired("Поле обязательно для заполнения"),
  region_okato: StringType().isRequired("Поле обязательно для заполнения"),
  address: StringType().isRequired("Поле обязательно для заполнения"),
  name: StringType().isRequired("Поле обязательно для заполнения"),
  qty: NumberType().isRequired("Поле обязательно для заполнения"),
  unit_code: StringType().isRequired("Поле обязательно для заполнения"),
});

const PositionEditModal: React.FC<PositionEditModalProps> = ({
  position,
  setData,
  isOpen,
  setOpen,
  addPositions,
  options,
}) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const actionType = formGlobalServerData?.actionType;
  const isViaPlan = formGlobalServerData?.isViaPlan;
  const lotId = formGlobalServerData?.lotId;
  const isAddType = position.id === "null";
  const biddingPerPositionOption =
    options?.includes("bidding_per_position_option") ?? false;
  const [formValue, setFormValue] = useState({
    unit_code: "",
    address: "",
    extra_info: "",
    ...position,
    okpd_code: `${position.okpd_field?.split(". ")[0]}; ${position.okpd_field?.split('. ')[1]?.trim()}`,
    okved_code: `${position.okved_field?.split(". ")[0]}; ${position.okved_field?.split('. ')[1]?.trim()}`,
  });
  const [formError, setFormError] = useState<ILotPosition>({});
  const formRef = React.useRef();
  const queryClient = useQueryClient();

  const handleClose = () => setOpen(false);

  const regionsQuery = useQuery(
    "regions2",
    async () => {
      const regions = await fetchRegions();
      if (regions.length) {
        if (!formValue.region_okato) {
          setFormValue((state) => ({
            ...state,
            region_okato: position?.okato || regions[0]?.okato,
            region_name: regions.find(
              (reg) => reg.okato === position?.okato || regions[0]?.okato
            ).nameWithType,
          }));
        }
      }
      return regions;
    },
    {
      // refetchInterval: false,
      // refetchOnMount: false,
      // refetchIntervalInBackground: false,
      // refetchOnWindowFocus: false,
    }
  );

  // useEffect(() => {
  //   console.log('regggggg', regionsQuery.data)
  //   if (regionsQuery?.data?.length) {

  //     setFormValue(state => ({ ...state, region_name: regionsQuery.data.find(reg => reg.okato === formValue.region_okato).nameWithType }))
  //   }
  // }, [formValue])
  const handleSubmit = async () => {
    // console.log("vvvvv", formValue);
    // console.log("errr", formError);
    if (!formRef.current.check()) {
      sendToast("error", "Пожалуйста исправьте ошибки");
      // toaster.push(<Message type="error">Пожалуйста исправьте ошибки</Message>);
      document
        .querySelector(
          ".rs-modal-content .rs-form-group .rs-form-error-message"
        )
        ?.parentNode?.parentNode?.scrollIntoView();
      document
        .querySelector(".rs-modal-content .rs-form-error-message-inner")
        ?.scrollIntoView();
      return;
    }
    // if (!formValue.okpd_code) return;
    const selectedOkpd = formValue.okpd_code
    const selectedOkpdCode = selectedOkpd.split(';')[0]
    const selectedOkpdName = selectedOkpd.split(';')[1].trim()

    const selectedOkved = formValue.okved_code
    const selectedOkvedCode = selectedOkved.split(';')[0]
    const selectedOkvedName = selectedOkved.split(';')[1].trim()
    // const okpdCodes = queryClient.getQueryData(["okpdCodes"]);
    // const selectedOkpd =
    //   okpdCodes?.find((code) => code.value === formValue.okpd_code) || null;
    // // if (!selectedOkpd) return;
    // const selectedOkpdCode = selectedOkpd.label.split(":")[0];
    // const selectedOkpdName = selectedOkpd.label.split(":")[1].trim();
    // const okvedCodes = queryClient.getQueryData(["okvedCodes"]);
    // const selectedOkved =
    //   okpdCodes?.find((code) => code.value === formValue.okved_code) || null;
    // // if (!selectedOkpd) return;
    // const selectedOkvedCode = selectedOkved.label.split(":")[0];
    // const selectedOkvedName = selectedOkved.label.split(":")[1].trim();

    const newPosition = {
      id: position.id,
      name: formValue.name,
      unit_id: formValue.unit_code,
      info: formValue.extra_info,
      okpd_name: selectedOkpdName,
      okpd_code: selectedOkpdCode,
      okpd_field: `${selectedOkpdCode}. ${selectedOkpdName}`,
      okved_name: selectedOkvedName,
      okved_code: selectedOkvedCode,
      okved_field: `${selectedOkvedCode}. ${selectedOkvedName}`,
      region_name: formValue.region_name,
      full_region: `${position.region_name} ${formValue.address}`,
      region_okato: formValue.region_okato,
      okato: formValue.region_okato,
      region_address: formValue.address,
      qty: formValue.qty,
      type_item: formValue.type_item,
      amount: formValue.amount,
      unit_amount: formValue.unit_amount,
      unit_name: position.unit_name,
      qty_count: `${position.qty}, ${position.unit_name}`,
    };
    // console.log("new possss", newPosition);
    if (newPosition) {
      if (isAddType) {
        setData((state) => [
          { ...newPosition, number: position.number, id: uuidv4() },
          ...state,
        ]);
      } else {
        setData((state) => [
          ...state?.filter((pos) => pos.id !== position.id),
          { ...newPosition, number: position.number },
        ]);
      }
      if (actionType === ProcedureFormActionVariants.EDIT) {
        try {
          await updateLotPosition(position.id_legacy, {
            amount: `RUB ${currency(parseFloat(newPosition.amount)).intValue}`,
            unit_price: `RUB ${currency(parseFloat(newPosition.unit_amount)).intValue
              }`,
            info: formValue.extra_info,
            region_address: newPosition.region_address,
            unit_value: newPosition.unit_id,
            okpd_code: newPosition.okpd_code,
            okpd_name: newPosition.okpd_name,
            okved_code: newPosition.okved_code,
            okved_name: newPosition.okved_name,
            qty: parseFloat(newPosition.qty),
          });
          sendToast("success", "Позиция лота успешно обновлена");
          setOpen(false);
        } catch (err) {
          sendToast(
            "error",
            `Ошибка при обновлении позиции ${JSON.stringify(err)}`
          );
        }
      } else {
        if (isAddType) {
          console.log("addd posss", {
            unit_id: newPosition.unit_id,
            info: newPosition.info,
            name: newPosition.name,
            okpd_name: newPosition.okpd_name,
            okpd_code: newPosition.okpd_code,
            okved_name: newPosition.okved_name,
            okved_code: newPosition.okved_code,
            region_name: newPosition.region_name,
            region_okato: newPosition.okato,
            region_address: newPosition.region_address,
            qty: newPosition.qty,
            type_item: newPosition.type_item,
            amount: null,
          });
          addPositions({
            unit_id: newPosition.unit_id,
            info: newPosition.info?.trim()?.length ? newPosition.info : null,
            name: newPosition.name,
            okpd_name: newPosition.okpd_name,
            okpd_code: newPosition.okpd_code,
            okved_name: newPosition.okved_name,
            okved_code: newPosition.okved_code,
            region_name: newPosition.region_name,
            region_okato: newPosition.okato,
            region_address: newPosition.region_address,
            qty: parseFloat(newPosition.qty),
            type_item: newPosition.type_item,
            amount: null,
          });
          setOpen(false);
        } else {
          addPositions({
            name: newPosition.name,
            amount: `RUB ${currency(parseFloat(newPosition.amount)).intValue}`,
            address: newPosition?.region_address || null,
          });
          setOpen(false);
        }
      }
    }
  };

  useEffect(() => {
    if (formValue.unit_amount && formValue.qty) {
      const unitAmount = currency(parseFloat(formValue.unit_amount));
      const qty = parseFloat(formValue.qty);
      const fullAmount = unitAmount.multiply(qty).toString();
      setFormValue((state) => ({ ...state, amount: fullAmount }));
    }
  }, [formValue.unit_amount, formValue.qty]);

  useEffect(() => {
    if (formValue.region_okato && regionsQuery?.data?.length) {
      const region = regionsQuery?.data.find(
        (r) => r.okato === formValue.region_okato
      );
      if (!region) return;
      setFormValue((state) => ({ ...state, region_name: region.nameWithType }));
    }
  }, [formValue.region_okato]);

  useEffect(() => {
    queryClient.invalidateQueries("regions2");
  }, []);

  // useEffect(() => { setFormValue(position) }, [position])
  useEffect(() => {
    if (!isOpen) {
      setFormValue({});
    } else if (isOpen) {
      setFormValue({
        unit_code: "",
        address: "",
        extra_info: "",
        ...position,
        okpd_code: `${position.okpd_field?.split(". ")[0]}; ${position.okpd_field?.split('. ')[1]?.trim()}`,
        okved_code: `${position.okved_field?.split(". ")[0]}; ${position.okved_field?.split('. ')[1]?.trim()}`,
      });
    }
    // else if (isOpen) {
    //   document.querySelector('.rs-modal-content')?.scrollIntoView
    // }
  }, [isOpen]);

  //  const  = useQuery("okvedCodes", async () => {
  //    const okpdCodes = await fetchOkvedCodes();
  //    return okpdCodes.map((code) => ({
  //      value: code.id,
  //      label: `${code.key}: ${code.name}`,
  //    }));
  //  });

  console.log('possssssssssssss', formValue)

  return (
    <Modal
      size="md"
      open={isOpen}
      onClose={handleClose}
      backdrop="static"
      autoFocus
      enforceFocus
    >
      <Form
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        ref={formRef}
        model={isAddType ? modelAddType : model}
      >
        <Modal.Header>
          <Modal.Title>
            {isAddType
              ? "Добавить позицию"
              : `Редактирование позиции №${position.number}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: 500 }}>
          {isAddType ? null : (
            <Field
              label="Номер позиции"
              name="number"
              accepter={Input}
              error={formError.number}
              disabled={!isAddType}
            />
          )}
          <Field
            label="Наименование"
            name="name"
            accepter={Input}
            error={formError.name}
          />
          <Field
            label="Вид продукции"
            name="type_item"
            accepter={PositionTypePicker}
            value={formValue.type_item}
            initialValue={formValue.type_item}
            setInitialValue={(value) => {
              setFormValue((state) => ({ ...state, type_item: value }));
              if (value) {
                setFormError((state) => ({ ...state, type_item: null }));
              }
            }}
            error={formError.type_item}
            disabled={!isAddType}
          />
          <Field
            label="Единица измерения"
            name="unit_code"
            accepter={PositionUnitPicker}
            value={formValue?.unit_code || formValue?.unit_id}
            initialValue={formValue?.unit_code || formValue?.unit_id}
            setInitialValue={(value) => {
              setFormValue((state) => ({ ...state, unit_code: value }));
              if (value) {
                setFormError((state) => ({ ...state, unit_code: null }));
              }
            }}
            error={formError.unit_code}
            disabled={!isAddType}
          />
          <Field
            label="Количество"
            name="qty"
            accepter={InputNumber}
            scrollable={false}
            error={formError.qty}
            disabled={isViaPlan}
          />
          <Field
            label="Код ОКПД 2"
            name="okpd_code"
            accepter={OkpdCodePicker}
            value={formValue.okpd_code}
            initialValue={`${formValue?.okpd_code?.split(';')[0]}; ${formValue?.okpd_code?.split(';')[1]?.trim()}`}
            setInitialValue={(value) => {
              setFormValue((state) => ({ ...state, okpd_code: value }));
              if (value) {
                setFormError((state) => ({ ...state, okpd_code: null }));
              }
            }}
            error={formError.okpd_code}
            disabled={!isAddType}
          />
          <Field
            label="Код ОКВЭД 2"
            name="okved_code"
            accepter={OkvedCodePicker}
            value={formValue.okved_code}
            initialValue={`${formValue?.okved_code?.split(';')[0]}; ${formValue?.okved_code?.split(';')[1]?.trim()}`}
            setInitialValue={(value) => {
              setFormValue((state) => ({ ...state, okved_code: value }));
              if (value) {
                setFormError((state) => ({ ...state, okved_code: null }));
              }
            }}

            error={formError.okved_code}
            disabled={isViaPlan}
          />
          {biddingPerPositionOption ? (
            <>
              <Field
                label="Цена за единицу"
                placeholder="0.00"
                min={0}
                step={0.5}
                className="rs-input"
                name="unit_amount"
                accepter={CurrencyInput}
                onChange={(e, value) =>
                  setFormValue((state) => ({ ...state, unit_amount: value }))
                }
                error={formError.unit_amount}
              />
              <Field
                label="Итоговая цена"
                name="amount"
                accepter={InputNumber}
                scrollable={false}
                error={formError.amount}
                disabled
              />
            </>
          ) : null}
          <Field
            label="Регион поставки"
            name="region_okato"
            accepter={SelectPicker}
            error={formError.region_okato}
            data={
              regionsQuery?.data?.length
                ? regionsQuery.data.map((region) => ({
                  value: region.okato,
                  label: region.nameWithType,
                }))
                : []
            }
            loading={regionsQuery?.isLoading}
            disabled={isViaPlan}
          />
          <Field
            label="Адрес"
            name="address"
            accepter={Input}
            value={formValue.address}
            error={formError.address}
            onChange={(value) => {
              if (value) {
                setFormValue((state) => ({ ...state, address: value }));
                setFormError((state) => ({ ...state, address: null }));
              }
            }}
            as="textarea"
          />
          <Field
            label="Доп. информация"
            name="extra_info"
            accepter={Input}
            value={formValue.extra_info}
            error={formError.extra_info}
            onChange={(value) => {
              setFormValue((state) => ({ ...state, extra_info: value }));
              if (value) {
                setFormError((state) => ({ ...state, extra_info: null }));
              }
            }}
            as="textarea"
            style={{ width: "100%" }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Form.Group>
            <Button onClick={handleClose} appearance="subtle">
              Отменить
            </Button>
            <Button onClick={handleSubmit} appearance="primary">
              Сохранить
            </Button>
          </Form.Group>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PositionEditModal;
