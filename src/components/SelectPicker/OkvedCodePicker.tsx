import React, { useEffect, useState } from "react";
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
  const [value, setValue] = useState<string>("")
  const [searchString, setSearchString] = useState<string>("")
  const [foundData, setFoundData] = useState([])
  const { data, isLoading, refetch } = useQuery(["okvedCodes", searchString], async () => {
    const okpdCodes = await fetchOkvedCodes(searchString);
    return okpdCodes.map((code) => ({
      value: `${code.key}; ${code.name}`,
      label: `${code.key}: ${code.name}`,
    }));
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
      // onChange={(value) => {
      //   setInitialValue(value);
      // }}
      loading={isLoading}
    />
  );
};

export default OkvedCodePicker;
