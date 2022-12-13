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
      children={
        dataKey === "select" ? (
          <Checkbox
            checked={
              selected.find((item) => item.id === rowData.id) ? true : false
            }
            onChange={(value) => {
              setSelected([rowData]);
            }}
          />
        ) : null
      }
    />
  );
};
const CompactHeaderCell = (props) => (
  <HeaderCell {...props} style={{ padding: 4 }} resizable />
);

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
      height={500}
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
              dataKey={key}
              selected={selectedItems}
              setSelected={setSelectedItems}
            />
          </Column>
        );
      })}
    </BaseTable>
  );
};

export default Table;
