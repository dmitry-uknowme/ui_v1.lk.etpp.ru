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
  const [value, setValue] = useState<string>("")
  const [searchString, setSearchString] = useState<string>("")
  const [foundData, setFoundData] = useState([])
  const { data, isLoading } = useQuery(["lotPositionUnits", searchString], async () => {
    const units = await fetchLotPositionUnits(searchString);
    return units.map((unit) => ({ value: unit.id, label: unit.name }));
  }, { refetchInterval: false });

  useEffect(() => {
    setFoundData(data)
  }, [data])

  useEffect(() => {
    setInitialValue(value)
  }, [value])
  return (
    <SelectPicker
      data={foundData}
      value={initialValue || value}
      onChange={(value) => {
        setValue(value)
      }}
      onSearch={(value) => {
        setSearchString(value)
      }}
      loading={isLoading}
    />
  );
};

export default PositionUnitPicker;
