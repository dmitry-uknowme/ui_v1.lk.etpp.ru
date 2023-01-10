import React, { useEffect, useState } from "react";
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
  disabled
}) => {
  const [searchString, setSearchString] = useState<string>("")
  const { data, isLoading } = useQuery(["okpdCodes", searchString], async () => {
    const okpdCodes = await fetchOkpdCodes(searchString);
    return [...(initialData?.length ? initialData : []), ...okpdCodes.map((code) => ({
      value: `${code.key}; ${code.name}`,
      label: `${code.key}: ${code.name}`,
    }))];
  }, { refetchInterval: false, refetchOnWindowFocus: false, refetchIntervalInBackground: false, });
  console.log('ssssss', searchString)
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

export default OkpdCodePicker;








// import { atom, onUpdate, reatomAsync, withAbort, withDataAtom, withRetry, sleep, debounce } from "@reatom/framework";
// import { useAtom } from "@reatom/npm-react";
// import React, { useEffect, useState } from "react";
// import { useQuery } from "react-query";
// import { SelectPicker } from "rsuite";
// import fetchLotPositionUnits from "../../services/api/fetchLotPositionUnits";
// import apiFetchOkpdCodes from "../../services/api/fetchOkpdCodes";

// interface PositionUnitPickerProps {
//   initialData?: any;
//   initialValue?: string;
//   setInitialValue?: React.Dispatch<React.SetStateAction<string>>;
// }

// const searchStringAtom = atom('', 'searchStringAtom')
// const valueAtom = atom('', 'valueAtom')

// const fetchOkpdCodes = reatomAsync(async (ctx, query: string) => {

//   const codes = await apiFetchOkpdCodes(query)
//   return codes.map((code) => ({
//     value: `${code.key}; ${code.name}`,
//     label: `${code.key}: ${code.name}`,
//   }));
// }, 'fetchOkpdCodes').pipe(
//   // debounce(100),
//   withDataAtom([]),
//   withAbort({ strategy: 'last-in-win' }),
//   // withRetry({
//   //   onReject(ctx, error: any, retries) {
//   //     return error?.message.includes('rate limit')
//   //       ? 100 * Math.min(500, retries ** 2)
//   //       : -1
//   //   }
//   // })
// )

// onUpdate(searchStringAtom, fetchOkpdCodes)

// const OkpdCodePicker: React.FC<PositionUnitPickerProps> = ({
//   initialData,
//   initialValue,
//   setInitialValue,
// }) => {
//   const [value, setValue] = useAtom(valueAtom)
//   const [searchString, setSearchString] = useAtom(searchStringAtom)
//   const [foundData, setFoundData] = useAtom(fetchOkpdCodes.dataAtom)
//   const [isLoading] = useAtom(ctx => {
//     console.log(ctx)
//     return ctx.spy(fetchOkpdCodes.pendingAtom) > 0
//   })
//   // const { data, isLoading } = useQuery(["okpdCodes", searchString], async () => {
//   //   const okpdCodes = await fetchOkpdCodes(searchString);
//   //   return okpdCodes.map((code) => ({
//   //     value: `${code.key}; ${code.name}`,
//   //     label: `${code.key}: ${code.name}`,
//   //   }));
//   // }, { refetchInterval: false });

//   // useEffect(() => {
//   //   setFoundData(data)
//   // }, [data])

//   useEffect(() => {
//     if (setInitialValue) { setInitialValue(value) }
//   }, [value])

//   // useEffect(() => {

//   //   if (!foundData?.map(data => (data.value))?.includes(value) && searchString?.trim().length === 0) {

//   //     // setSearchString(value.split('; ')[1])
//   //   }
//   // }, [foundData, searchString, value])

//   return (
//     <SelectPicker
//       data={foundData}
//       value={initialValue || value}
//       onChange={(value) => {
//         if (value) {
//           setValue(value)
//         }
//       }}
//       onSearch={(value) => {
//         console.log('sssss', value)
//         setSearchString(value)
//       }}
//       loading={isLoading}
//     />
//   );
// };

// export default OkpdCodePicker;
