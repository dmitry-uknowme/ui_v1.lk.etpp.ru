import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { SelectPicker } from "rsuite";
import fetchLotPositionUnits from "../../services/api/fetchLotPositionUnits";
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
  disabled
}) => {
  const [isInitialized, setInitialized] = useState<boolean>(false)
  const [searchString, setSearchString] = useState<string>("")
  const [foundData, setFoundData] = useState([])
  const { data, isLoading } = useQuery(["okvedCodes", searchString], async () => {
    const okvedCodes = await fetchOkvedCodes(searchString);
    return [...(initialData?.length ? initialData : []), ...okvedCodes.map((code) => ({
      value: `${code.key}; ${code.name}`,
      label: `${code.key}: ${code.name}`,
    }))];
  }, { refetchInterval: false, refetchOnWindowFocus: false, refetchIntervalInBackground: false, });




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
        setSearchString(value)
      }}
      loading={isLoading}
      disabled={disabled}
    />
  );
};

export default OkvedCodePicker;