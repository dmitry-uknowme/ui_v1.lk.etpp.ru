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
  disabled
}) => {
  const [searchString, setSearchString] = useState<string>("")
  const { data, isLoading } = useQuery(["lotPositionUnits", searchString], async () => {
    const units = await fetchLotPositionUnits(searchString);
    return [...(initialData?.length ? initialData : []), units.map((unit) => ({ value: unit.id, label: unit.name }))];
  }, { refetchInterval: false });




  return (
    <SelectPicker
      data={data}
      value={initialValue}
      onChange={(value) => {
        if (setInitialValue && value) {
          setInitialValue(value)
        }

      }}
      onSearch={(value) => {
        if (value) {
          setSearchString(value)
        }
      }}
      loading={isLoading}
      disabled={disabled}
    />
  );
};

export default PositionUnitPicker;
