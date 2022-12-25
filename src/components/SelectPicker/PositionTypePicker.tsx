import React from "react";
import { SelectPicker } from "rsuite";

interface PositionUnitPickerProps {
  initialData?: any;
  initialValue?: string;
  setInitialValue?: React.Dispatch<React.SetStateAction<string>>;
}

const positionTypes = [
  { value: "TYPE_PRODUCT", label: "Поставка товара" },
  { value: "TYPE_SERVICE", label: "Оказание услуг" },
  { value: "TYPE_WORK", label: "Выполнение работ" },
];

const PositionTypePicker: React.FC<PositionUnitPickerProps> = ({
  initialData,
  initialValue,
  setInitialValue,
}) => {
  return (
    <SelectPicker
      data={initialData || positionTypes}
      value={initialValue}
      onChange={(value) => {
        setInitialValue(value);
      }}
    />
  );
};

export default PositionTypePicker;
