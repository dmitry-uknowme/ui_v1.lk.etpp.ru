import { Checkbox } from "rsuite";
import Table from "..";

const PurchasePlanTable = (props) => {
  // console.log("dddddd", props);
  return (
    <Table
      height={500} wordWrap="break-word"
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
    />
  );
};

export default PurchasePlanTable;
