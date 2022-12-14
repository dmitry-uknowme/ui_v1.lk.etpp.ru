import { useEffect, useState } from "react";
import { Button, Checkbox, IconButton, SelectPicker } from "rsuite";
import { Table, Toggle, TagPicker } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import PositionEditModal from "./PositionEditModal";
import { ProcedureFormActionVariants } from "../../../pages/ProcedureForm";
import { useQuery } from "react-query";
import PlusIcon from "@rsuite/icons/Plus";
import fetchRegions from "../../../services/api/fetchRegions";
import PositionAddModal from "./PositionAddModal";

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



const RegionCell = ({ rowData, dataKey, regionsQuery, data, ...props }) => (
  <>
    {rowData.id === 'null' ? null : rowData[dataKey]?.split(",")?.length === 2 ? (
      <Cell {...props}>{rowData[dataKey]}</Cell>
    ) : (
      <Cell {...props}>
        <SelectPicker
          style={{ fontSize: "0.6rem" }}
          label=""
          value={data?.length ? data[0].okato : null}
          data={
            regionsQuery?.data?.length
              ? regionsQuery.data.map((region) => ({
                value: region.okato,
                label: region.nameWithType,
              }))
              : []
          }
          loading={regionsQuery?.isLoading}
          disabled
        />
      </Cell>
    )}
  </>
);

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

const ActionCell = ({ rowData, dataKey, onClick, isViaPlan, ...props }) => {
  return (
    <Cell {...props} style={{ padding: "6px" }}>
      <Button
        appearance="link" onClick={() => onClick(rowData.id)}

      >
        <div
          className="d-flex flex-column justify-content-center"
          style={{ fontSize: "0.8rem" }}
        >
          {rowData.id === "null" && !rowData.number && !isViaPlan ? (
            <>
              <Button
                appearance="primary"
                style={{ display: "flex", alignItems: "center" }}
              >
                <PlusIcon style={{ fontSize: "0.7rem" }} />
                Добавить
              </Button>
            </>
          ) : (
            <div >
              <EditIcon style={{ display: "block", margin: "auto" }} />
              Редактировать
            </div>
          )}
        </div>
      </Button>
    </Cell>
  );
};

const LotPositionsTable = ({
  data: defaultData,
  addPositions,
  setPositionsTableData,
  options,
  activeStep,
  isViaPlan,
}) => {
  const biddingPerPositionOption =
    options?.includes("bidding_per_position_option") ?? false;
  const [data, setData] = useState(defaultData);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [currentRegionOkato, setCurrentRegionOkato] = useState("");


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
    setSelectedPosition(position);
    setEditModalOpen(true);
  };

  const openAddModal = (positionId: any) => {
    const position = data.find((pos) => pos.id === positionId);
    setSelectedPosition(position);
    setAddModalOpen(true);
  };

  const modalHandler = (positionId: string) => {
    console.log('modal')
    if (positionId === 'null') {
      openAddModal(positionId)
    }
    else {
      openEditModal(positionId)
    }

  }



  const regionsQuery = useQuery(
    "regions",
    async () => {
      const regions = await fetchRegions();
      if (regions.length) {
        if (!currentRegionOkato) {
          setCurrentRegionOkato(data[0]?.okato);
        }
      }
      return regions;
    },
    {
      // refetchInterval: false,
      // refetchOnMount: false,
      // refetchIntervalInBackground: false,
      // refetchOnWindowFocus: false,
    }
  );



  return (
    <>
      {isEditModalOpen ? (
        <PositionEditModal
          isOpen={isEditModalOpen}
          setOpen={setEditModalOpen}
          position={selectedPosition}
          setData={setPositionsTableData}
          addPositions={addPositions}
          options={options}
        />
      ) : isAddModalOpen ? (<PositionAddModal
        isOpen={isAddModalOpen}
        setOpen={setAddModalOpen}
        position={selectedPosition}
        setData={setPositionsTableData}
        addPositions={addPositions}
        options={options}
      />) : null}
      <Table
        height={420}
        headerHeight={50}
        data={data}
        wordWrap="break-word"
        style={{ fontSize: "0.8rem" }}
        sortColumn="number"
        sortType="asc"
      >
        {activeStep > 3 ? null : (
          <Column width={120}>
            <HeaderCell>Действия</HeaderCell>
            {/* <Button onClick={() => console.log('clickkkkkkk')}>fada</Button> */}
            <ActionCell dataKey="id" onClick={modalHandler} />
          </Column>
        )}
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
        {biddingPerPositionOption ? (
          <>
            {/* <Column width={100}>
            <HeaderCell>Цена за единицу</HeaderCell>
            <EditableCell dataKey="unit_amount" onChange={handleChange} />
          </Column> */}
            <Column width={100}>
              <HeaderCell>Сумма</HeaderCell>
              <EditableCell dataKey="amount" onChange={handleChange} />
            </Column>
          </>
        ) : null}
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
        {/* <Column width={210}>
          <HeaderCell wordWrap="break-all">Место поставки</HeaderCell>
          <Cell
            dataKey="region"
            onChange={handleChange}
            wordWrap="break-all"
          >


          </Cell>
        </Column> */}
        <Column width={210}>
          <HeaderCell wordWrap="break-all">Место поставки</HeaderCell>
          <RegionCell
            dataKey="region"
            regionsQuery={regionsQuery}
            data={data}
          />
        </Column>
        <Column width={150}>
          <HeaderCell>Доп. информация</HeaderCell>
          <Cell dataKey="extra_info" />
        </Column>
      </Table>
    </>
  );
};

export default LotPositionsTable;
