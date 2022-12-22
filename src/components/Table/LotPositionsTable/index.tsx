import { useEffect, useState } from "react";
import { Button, Checkbox, SelectPicker } from "rsuite";
import { Table, Toggle, TagPicker } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import PositionEditModal from "./PositionEditModal";
import { ProcedureFormActionVariants } from "../../../pages/ProcedureForm";
import { useQuery } from "react-query";
import fetchRegions from "../../../services/api/fetchRegions";

const { Cell, HeaderCell, Column } = Table;
const dataColumns = [
  {
    key: "number",
    label: "Номер",
    fixed: true,
    width: 70,
  },
  {
    key: "okpd_field",
    label: "ОКПД2",
    width: 120,
  },
  {
    key: "okved_field",
    label: "ОКВЭД2",
    width: 120,
  },
  {
    key: "qty",
    label: "Кол-во, ед. изм.",
    width: 100,
  },
  {
    key: "region",
    label: "Регион поставки",
    width: 200,
  },
];
const ActionCell = ({ rowData, dataKey, onClick, ...props }) => {
  return (
    <Cell {...props} style={{ padding: "6px" }}>
      <Button
        appearance="link"
        onClick={() => {
          onClick(rowData.id);
        }}
      >
        {rowData.status === "EDIT" ? (
          "Сохранить"
        ) : (
          <div className="d-flex flex-column justify-content-center" style={{ fontSize: "0.8rem" }}>
            <EditIcon style={{ display: "block", margin: "auto" }} />
            Редактировать
          </div>
        )}
      </Button>
    </Cell>
  );
};
const EditableCell = ({ rowData, dataKey, onChange, ...props }) => {
  const editing = rowData.status === "EDIT";
  return (
    <Cell {...props} className={editing ? "table-content-editing" : ""}>
      {editing ? (
        <input
          className="rs-input"
          defaultValue={rowData[dataKey]}
          onChange={(event) => {
            onChange && onChange(rowData.id, dataKey, event.target.value);
          }}
        />
      ) : (
        <span className="table-content-edit-span">{rowData[dataKey]}</span>
      )}
    </Cell>
  );
};

const LotPositionsTable = ({ data: defaultData, addPositions, setPositionsTableData, options, activeStep }) => {
  const biddingPerPositionOption = options?.includes("bidding_per_position_option") ?? false
  const [data, setData] = useState(defaultData);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [currentRegionOkato, setCurrentRegionOkato] = useState("")
  useEffect(() => {
    setData(defaultData);
  }, [defaultData]);

  const handleChange = (id, key, value) => {
    const nextData = Object.assign([], data);
    nextData.find((item) => item.id === id)[key] = value;
    setData(nextData);
  };
  const handleEditState = (id) => {
    const nextData = Object.assign([], data);
    const activeItem = nextData.find((item) => item.id === id);
    activeItem.status = activeItem.status ? null : "EDIT";
    setData(nextData);
  };

  const openEditModal = (positionId: any) => {
    const position = data.find((pos) => pos.id === positionId);
    setEditingPosition(position);
    setEditModalOpen(true);
  };



  const regionsQuery = useQuery(
    "regions",
    async () => {
      const regions = await fetchRegions();
      if (regions.length) {
        if (!currentRegionOkato) {
          setCurrentRegionOkato(regions[0]?.okato)
        }

      }
      return regions;
    },
    {
      refetchInterval: false,
      // refetchOnMount: false,
      // refetchIntervalInBackground: false,
      // refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      {editingPosition ? (
        <PositionEditModal
          isOpen={isEditModalOpen}
          setOpen={setEditModalOpen}
          position={editingPosition}
          setData={setPositionsTableData}
          addPositions={addPositions}
          options={options}
        />
      ) : null}
      <Table height={420} headerHeight={50} data={data} wordWrap="break-word" style={{ fontSize: "0.8rem" }}>
        {activeStep > 3 ? null : <Column width={120}>
          <HeaderCell >Действия</HeaderCell>
          <ActionCell dataKey="id" onClick={openEditModal} />
        </Column>}
        <Column width={60}>
          <HeaderCell>№</HeaderCell>
          <Cell dataKey="number" onChange={handleChange} />
        </Column>
        <Column width={80}>
          <HeaderCell>Наименование</HeaderCell>
          <Cell dataKey="name" onChange={handleChange} />
        </Column>
        <Column width={100}>
          <HeaderCell>Количество, Ед. изм.</HeaderCell>
          <Cell dataKey="qty_count" onChange={handleChange} />
        </Column>
        {biddingPerPositionOption ? <>
          <Column width={100}>
            <HeaderCell>Цена за единицу</HeaderCell>
            <EditableCell dataKey="unit_amount" onChange={handleChange} />
          </Column>
          <Column width={100}>
            <HeaderCell>Сумма</HeaderCell>
            <EditableCell dataKey="amount" onChange={handleChange} />
          </Column></> : null}
        <Column width={120}>
          <HeaderCell>ОКПД 2</HeaderCell>
          <Cell dataKey="okpd_field" onChange={handleChange} />
        </Column>
        <Column width={120}>
          <HeaderCell wordWrap="break-all">ОКВЭД 2</HeaderCell>
          <Cell
            dataKey="okved_field"
            onChange={handleChange}
            wordWrap="break-all"
          />
        </Column>
        <Column width={210}>
          <HeaderCell wordWrap="break-all">Регион поставки</HeaderCell>
          <Cell
            dataKey="region"
            onChange={handleChange}
            wordWrap="break-all"
          >
            <SelectPicker style={{ fontSize: "0.6rem" }} label="" value={data?.length ? data[0].okato : null} data={
              regionsQuery?.data?.length
                ? regionsQuery.data.map((region) => ({
                  value: region.okato,
                  label: region.nameWithType,
                }))
                : []
            }
              loading={regionsQuery?.isLoading} disabled />
          </Cell>
        </Column>
      </Table>
    </>
  );
};

export default LotPositionsTable;
