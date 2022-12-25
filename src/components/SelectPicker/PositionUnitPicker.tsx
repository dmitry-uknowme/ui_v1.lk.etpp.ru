import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { SelectPicker } from "rsuite";
import fetchLotPositionUnits from "../../services/api/fetchLotPositionUnits";

interface PositionUnitPickerProps {
  initialData?: any;
  initialValue?: string;
  setInitialValue?: React.Dispatch<React.SetStateAction<string>>;
}

const PositionUnitPicker: React.FC<PositionUnitPickerProps> = ({
  initialData,
  initialValue,
  setInitialValue,
}) => {
  // const [value, setValue] = useState(initialValue);
  // useEffect(() => {
  //   setValue(initialValue);
  // }, [initialValue]);
  const { data, isLoading } = useQuery("lotPositionUnits", async () => {
    const units = await fetchLotPositionUnits();
    return units.map((unit) => ({ value: unit.value, label: unit.name }));
  });
  return (
    <SelectPicker
      data={initialData || data}
      value={initialValue}
      onChange={(value) => {
        setInitialValue(value);
      }}
      loading={isLoading}
    />
  );
};

export default PositionUnitPicker;
