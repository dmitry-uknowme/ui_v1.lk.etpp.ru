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
import CurrencyInput from "react-currency-masked-input";
import fetchRegions from "../../../../services/api/fetchRegions";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import { ProcedureFormActionVariants } from "../../../../pages/ProcedureForm";
import updateLotPosition from "../../../../services/api/updateLotPosition";
import sendToast from "../../../../utils/sendToast";

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
        <Input as="textarea" name={name} {...rest} />
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

const PositionAddModal: React.FC<PositionEditModalProps> = ({
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
  const lotId = formGlobalServerData?.lotId;

  const biddingPerPositionOption =
    options?.includes("bidding_per_position_option") ?? false;
  const [formValue, setFormValue] = useState<ILotPosition>(position);
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
    console.log("vvvvv", formValue);
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
    const newPosition = {
      id: position.id,
      name: formValue.name,
      unit_id: formValue.unit_code,
      info: formValue.extra_info,
      okpd_name: formValue.okpd_name,
      okpd_code: formValue.okpd_code,
      okpd_field: `${formValue.okpd_code}. ${formValue.okpd_name}`,
      okved_name: formValue.okved_name,
      okved_code: formValue.okved_code,
      okved_field: `${formValue.okved_code}. ${formValue.okved_name}`,
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
    console.log("new possss", newPosition);
    if (newPosition) {
      setData((state) => [
        ...state?.filter((pos) => pos.id !== position.id),
        { ...newPosition, number: position.number },
      ]);
      if (actionType === ProcedureFormActionVariants.EDIT) {
        try {
          await updateLotPosition(position.id_legacy, {
            amount: `RUB ${currency(parseFloat(newPosition.amount)).intValue}`,
            unit_price: `RUB ${
              currency(parseFloat(newPosition.unit_amount)).intValue
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
        addPositions({
          id: newPosition.id,
          amount: `RUB ${currency(parseFloat(newPosition.amount)).intValue}`,
          name: newPosition?.name || null,
          address: newPosition?.region_address || null,
        });
        setOpen(false);
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
      setFormValue(position);
    }
    // else if (isOpen) {
    //   document.querySelector('.rs-modal-content')?.scrollIntoView
    // }
  }, [isOpen]);

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
        model={model}
      >
        <Modal.Header>
          <Modal.Title>Редактирование позиции №{position.number}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: 500 }}>
          <Field
            label="Номер позиции"
            name="number"
            accepter={Input}
            error={formError.number}
            disabled
          />
          <Field
            label="Наименование"
            name="name"
            accepter={Input}
            error={formError.name}
          />
          <Field
            label="Вид продукции"
            name="type_item"
            accepter={SelectPicker}
            error={formError.type_item}
            data={[{ value: "TYPE_PRODUCT", label: "Поставка товара" }]}
            disabled
          />
          <Field
            label="Единица измерения"
            name="unit_code"
            accepter={SelectPicker}
            error={formError.unit_code}
            data={[{ value: "616", label: "Бобина" }]}
            disabled
          />
          <Field
            label="Количество"
            name="qty"
            accepter={InputNumber}
            scrollable={false}
            error={formError.qty}
            disabled
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
            disabled
          />
          <Field
            label="Адрес"
            name="address"
            accepter={Input}
            value={formValue.address}
            error={formError.address}
            onChange={(value) =>
              setFormValue((state) => ({ ...state, address: value }))
            }
            as="textarea"
          />
          <Field
            label="Доп. информация"
            name="extra_info"
            accepter={Input}
            value={formError.extra_info}
            onChange={(value) =>
              setFormValue((state) => ({ ...state, extra_info: value }))
            }
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
