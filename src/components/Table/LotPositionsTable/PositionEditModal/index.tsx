import currency from "currency.js";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
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
});

const PositionEditModal: React.FC<PositionEditModalProps> = ({
  position,
  setData,
  isOpen,
  setOpen,
  addPositions,
}) => {
  const [formValue, setFormValue] = useState<ILotPosition>(position);
  const [formError, setFormError] = useState<ILotPosition>({});
  const formRef = React.useRef();

  const handleClose = () => setOpen(false);

  const regionsQuery = useQuery(
    "regions",
    async () => {
      const regions = await fetchRegions();
      if (regions.length) {
        if (!formValue.region_okato) {
          setFormValue((state) => ({
            ...state,
            region_okato: position?.okato || regions[0]?.okato,
          }));
        }
      }
      return regions;
    },
    {
      refetchInterval: false,
      // refetchOnMount: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  const handleSubmit = () => {
    if (!formRef.current.check()) {
      toaster.push(<Message type="error">Пожалуйста исправьте ошибки</Message>);
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
      region: formValue.region_name,
      region_okato: formValue.region_okato,
      region_address: formValue.address,
      qty: formValue.qty,
      type_item: formValue.type_item,
      amount: formValue.amount,
      unit_amount: formValue.unit_amount,
      qty_count: `${position.qty}, ${position.unit_name}`,
    };
    if (newPosition) {
      setData((state) => [
        ...state?.filter(
          (pos) => parseInt(pos.number) !== parseInt(position.number)
        ),
        { ...newPosition, number: position.number },
      ]);
      setOpen(false);
      addPositions({
        id: newPosition.id,
        amount: `RUB ${currency(parseFloat(newPosition.amount)).intValue}`,
        name: newPosition.name,
        address: newPosition.region_address,
      });
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

  return (
    <Modal size="md" open={isOpen} onClose={handleClose} backdrop="static">
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
            error={formError.qty}
            disabled
          />
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
            error={formError.amount}
            disabled
          />
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
