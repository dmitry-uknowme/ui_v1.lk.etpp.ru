import { Checkbox } from "rsuite";
import Table from "..";

const LotPositionsTable = (props) => {
  return (
    <Table
      dataColumns={[
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
        // {
        //   key: "planned_public_date",
        //   label: "Планируемая дата размещения извещения о закупке",
        // },
      ]}
      // data={[
      //   {
      //     id: "40109248092109421",
      //     number: 1,
      //     title: "test Наименование предмета договора",
      //     method:
      //       "Запрос предложений в электронной форме для субъектов малого предпринимательства",
      //     planned_public_date: "октябрь, 2024",
      //     start_price: "600.00 руб.",
      //   },
      //   {
      //     id: "321",
      //     number: 2,
      //     title: "test Наименование предмета договора 2",
      //     method:
      //       "Запрос предложений в электронной форме для субъектов малого предпринимательства",
      //     planned_public_date: "октябрь, 2024",
      //     start_price: "600.00 руб.",
      //   },
      // ]}

      {...props}
    />
  );
};

export default LotPositionsTable;
