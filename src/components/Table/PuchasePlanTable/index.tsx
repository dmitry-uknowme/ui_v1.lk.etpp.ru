import { useContext, useState } from "react";
import { Table, Toggle, TagPicker, Checkbox } from "rsuite";
import MultiStepFormContext from "../../../context/multiStepForm/context";

const { Column, HeaderCell, Cell } = Table;

const CompactCell = (props) => {
  const { dataKey, rowData, selected, setSelected } = props;

  return <Cell {...props} style={{ padding: 4 }} />;
};
const CompactHeaderCell = (props) => (
  <HeaderCell {...props} style={{ padding: 4 }} resizable />
);

const ActionCell = (props) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
    currentStepId,
    setCurrentStepId,
  } = useContext(MultiStepFormContext);
  const { dataKey, rowData } = props;
  const [checkedValue, setCheckedValue] = useState(false);
  // console.log('posssss', formGlobalServerData?.selectedPlanPosition, checkedValue)
  return (
    <Cell {...props} style={{ padding: "6px" }}>
      <Checkbox
        checked={
          rowData[dataKey] === formGlobalServerData?.selectedPlanPosition?.id
        }
        onChange={(value, checked) => {
          setFormGlobalServerData((state) => ({
            ...state,
            selectedPlanPosition: rowData,
          }));
          setCheckedValue(true);
        }}
      />
    </Cell>
  );
};

const PurchasePlanTable = (props) => {
  const { data, disabled, selectedItems, setSelectedItems } = props;
  // console.log("dddddd", props);
  return (
    <Table
      height={500}
      style={{ opacity: disabled ? "0.5" : "1" }}
      // loading={isLoading}
      hover
      showHeader
      data={data}
      bordered
      cellBordered
      headerHeight={30}
      rowHeight={30}
      wordWrap="break-word"
      dataColumns={[
        {
          key: "select",
          label: "Выбрать",
          fixed: true,
          width: 70,
        },
        {
          key: "number",
          label: "Номер позиции в плане",
          width: 120,
        },
        {
          key: "contract_subject",
          label: "Предмет договора (лота)",
          width: 200,
        },
        // {
        //   key: "planned_public_date",
        //   label: "Планируемая дата размещения извещения о закупке",
        // },
        {
          key: "purchase_method_name",
          label: "Способ закупки",
          width: 250,
        },
        {
          key: "maximum_contract_price",
          label: "Начальная (максимальная) цена договора (цена лота)",
        },
        {
          key: "planning_period_publication_at",
          label: "Планируемая дата размещения",
        },
        {
          key: "contract_end_date",
          label: "Срок истечения договора",
        },
        {
          key: "status_localized",
          label: "Статус",
        },
      ]}
      {...props}
    >
      <Column key="id" width={70}>
        <CompactHeaderCell>Выбрать</CompactHeaderCell>
        <ActionCell dataKey="id" />
      </Column>
      <Column key="number">
        <CompactHeaderCell>№ позиции в плане</CompactHeaderCell>
        <CompactCell dataKey="number" />
      </Column>
      <Column key="contract_subject">
        <CompactHeaderCell>Предмет договора (лота)</CompactHeaderCell>
        <CompactCell dataKey="contract_subject" />
      </Column>
      <Column key="purchase_method_name">
        <CompactHeaderCell>Способ закупки</CompactHeaderCell>
        <CompactCell dataKey="purchase_method_name" />
      </Column>
    </Table>
  );
};

export default PurchasePlanTable;
