import React from "react";
import { useQuery } from "react-query";
import { SelectPicker } from "rsuite";
import fetchOkvedCodes from "../../services/api/fetchOkvedCodes";

interface PositionUnitPickerProps {
  initialData?: any;
  initialValue?: string;
  setInitialValue?: React.Dispatch<React.SetStateAction<string>>;
}

const OkvedCodePicker: React.FC<PositionUnitPickerProps> = ({
  initialData,
  initialValue,
  setInitialValue,
}) => {
  const { data, isLoading, refetch } = useQuery("okvedCodes", async () => {
    const okpdCodes = await fetchOkvedCodes();
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

export default OkvedCodePicker;
