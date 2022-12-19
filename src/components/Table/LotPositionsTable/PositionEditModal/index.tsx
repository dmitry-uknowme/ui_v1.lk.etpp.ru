import currency from "currency.js";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Modal, SelectPicker } from "rsuite"

interface PositionEditModalProps {
    position: ILotPosition
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setData: React.Dispatch<React.SetStateAction<any>>;
}

export interface ILotPosition {
    id: string;
    item_id: string;
    number: string
    okato: string
    okpd_code: string
    okpd_name: string
    okpd_field?: string
    okved_code: string
    okved_name: string
    okved_field?: string
    qty?: string
    qty_count?: string
    region?: string
    type_item?: string
    unit_code?: string
    unit_name?: string
    unit_amount?: string
    amount?: string
    address?: string
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

const PositionEditModal: React.FC<PositionEditModalProps> = ({ position, setData, isOpen, setOpen }) => {
    console.log('possss', position)
    const [formValue, setFormValue] = useState<ILotPosition>(position)
    const [formError, setFormError] = useState<ILotPosition>({})
    const formRef = React.useRef();
    const handleClose = () => setOpen(false)

    useEffect(() => {
        if (formValue.unit_amount && formValue.qty) {
            const unitAmount = currency(parseFloat(formValue.unit_amount))
            const qty = parseFloat(formValue.qty)
            const fullAmount = unitAmount.multiply(qty).toString()
            setFormValue(state => ({ ...state, amount: fullAmount }))
        }

    }, [formValue.unit_amount, formValue.qty])
    return (
        <Modal size="md" open={isOpen} onClose={handleClose} >
            <Form
                onChange={setFormValue}
                onCheck={setFormError}
                formValue={formValue}>
                <Modal.Header>
                    <Modal.Title>Редактирование позиции №{position.number}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Field
                        label="Номер позиции"
                        name="number"
                        accepter={Input}
                        error={formError.number}
                        disabled
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
                        name="unit_amount"
                        accepter={InputNumber}
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
                        name="region"
                        accepter={SelectPicker}
                        error={formError.region}
                        data={[{ value: "02", label: "Респ. Башкортостан" }]}
                    />
                    <Field
                        label="Адрес"
                        name="address"
                        accepter={Input}
                        value={formValue.address}
                        error={formError.address}
                        onChange={(value) => setFormValue(value)}
                        as="textarea"
                    />
                    <Field
                        label="Доп. информация"
                        name="extra_info"
                        accepter={Input}
                        value={formValue.extra_info}
                        onChange={(value) => setFormValue(value)}
                        as="textarea"
                        style={{ width: "100%" }}
                    />


                </Modal.Body>
                <Modal.Footer>
                    <Form.Group>
                        <Button onClick={handleClose} appearance="subtle">
                            Отменить
                        </Button>
                        <Button onClick={handleClose} appearance="primary">
                            Сохранить
                        </Button>
                    </Form.Group>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default PositionEditModal