import React from "react";
import { Table as BaseTable, Toggle, TagPicker, Checkbox } from "rsuite";

interface TableProps {
  dataColumns: any[];
  data: any[];
  isLoading: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: any[];
  setSelectedItems: React.Dispatch<React.SetStateAction<any[]>>;
}

const { Column, HeaderCell, Cell } = BaseTable;

const CompactCell = (props) => {
  const { dataKey, rowData, selected, setSelected } = props;

  return (
    <Cell
      {...props}
      style={{ padding: 4 }}
    />
  );
};
const CompactHeaderCell = (props) => (
  <HeaderCell {...props} style={{ padding: 4 }} resizable />
);

const ActionCell = (props) => {
  const { dataKey, rowData, selected, setSelected } = props;

  return (
    <Cell {...props} style={{ padding: "6px" }}>
      <Checkbox
      // checked={
      //   selected[0]?.id === rowData.id ? true : false
      // }
      // // checked={
      // //   selected.find((item) => item.id === rowData.id) ? true : false
      // // }
      // onChange={(value) => {
      //   setSelected([rowData]);
      // }}
      />
    </Cell>
  );
};

const Table: React.FC<TableProps> = ({
  data,
  dataColumns,
  isLoading,
  setLoading,
  selectedItems,
  setSelectedItems,
  disabled,
}) => {
  return (
    <BaseTable
      style={{ opacity: disabled ? "0.5" : "1" }}
      loading={isLoading}
      hover
      showHeader
      data={data}
      bordered
      cellBordered
      headerHeight={30}
      rowHeight={30}
      wordWrap="break-word"
    >

      {dataColumns.map((column) => {
        const { key, label, ...rest } = column;
        return (
          <Column {...rest} key={key}>
            <CompactHeaderCell>{label}</CompactHeaderCell>
            <CompactCell
              dataKey={key} {...rest}
            />
          </Column>
        );
      })}
    </BaseTable>
  );
};

export default Table;
