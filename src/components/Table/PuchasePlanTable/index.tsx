import { Checkbox } from "rsuite";
import Table from "..";

const PurchasePlanTable = (props) => {
  return (
    <Table
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
        },
        {
          key: "title",
          label: "Предмет договора (лота)",
        },
        {
          key: "planned_public_date",
          label: "Планируемая дата размещения извещения о закупке",
        },
        {
          key: "method",
          label: "Способ закупки",
        },
        {
          key: "start_price",
          label: "Начальная (максимальная) цена договора (цена лота)",
        },
      ]}
      data={[
        {
          id: "40109248092109421",
          number: 1,
          title: "test Наименование предмета договора",
          method:
            "Запрос предложений в электронной форме для субъектов малого предпринимательства",
          planned_public_date: "октябрь, 2024",
          start_price: "600.00 руб.",
        },
        {
          id: "321",
          number: 2,
          title: "test Наименование предмета договора 2",
          method:
            "Запрос предложений в электронной форме для субъектов малого предпринимательства",
          planned_public_date: "октябрь, 2024",
          start_price: "600.00 руб.",
        },
      ]}
      isLoading={false}
      {...props}
    />
  );
};

export default PurchasePlanTable;
