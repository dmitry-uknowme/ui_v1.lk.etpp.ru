import React from "react";
import { useQuery } from "react-query";
import { SelectPicker } from "rsuite";
import fetchLotPositionUnits from "../../services/api/fetchLotPositionUnits";
import fetchOkpdCodes from "../../services/api/fetchOkpdCodes";

interface PositionUnitPickerProps {
  initialData?: any;
  initialValue?: string;
  setInitialValue?: React.Dispatch<React.SetStateAction<string>>;
}

const OkpdCodePicker: React.FC<PositionUnitPickerProps> = ({
  initialData,
  initialValue,
  setInitialValue,
}) => {
  const { data, isLoading } = useQuery("okpdCodes", async () => {
    const okpdCodes = await fetchOkpdCodes();
    return okpdCodes.map((code) => ({
      value: `${code.key}; ${code.name}`,
      label: `${code.key}: ${code.name}`,
    }));
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

export default OkpdCodePicker;
