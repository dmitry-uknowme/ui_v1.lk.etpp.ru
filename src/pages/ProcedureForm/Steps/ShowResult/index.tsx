import React from "react";
import { Link } from "react-router-dom";
import { Button, Modal, Panel, Placeholder, Table } from "rsuite";
import Money from "../../../../utils/money";
const ShowResult = ({ currentStep }) => {
  const data = {
    contract_type: "ON_SITE",
    name: "Тест конкурентный отбор",
    number: 20,
    bid_part: "ONE",
    bidding_per_unit: true,
    // original_price: "RUB 50",
    original_price: new Money(50),
    // bidding_per_unit_amount: "RUB 5",
    bidding_per_unit_amount: new Money(5),
    bidding_process: "da",
    contract_by_any_participant: true,
    provision_bid: {
      amount: "need",
      is_specified: "need",
      methods: "need",
    },
    provision_contract: {
      amount: "need",
      is_specified: "need",
      type: "need",
    },
    organizer: {
      email: "organizer@etpp.ru ",
      fact_address: "da",
      first_name: "СОтрудник",
      last_name: "Сотрудник",
      middle_name: "СОтрудник",
      legal_addres: { index: "Россия" },
      fact_addres: { index: "Россия" },
      ogrn: "824978217489",
      phone: "828939849",
      short_title: "ООО ЕТП РБ",
      full_title: "ООО ЕТП РБ",
    },
    customer: {
      email: "organizer@etpp.ru ",
      fact_address: "da",
      first_name: "СОтрудник",
      last_name: "Сотрудник",
      middle_name: "СОтрудник",
      legal_addres: { index: "Россия" },
      fact_addres: { index: "Россия" },
      ogrn: "824978217489",
      phone: "828939849",
      short_title: "ООО ЕТП РБ",
      full_title: "ООО ЕТП РБ",
      status: "Опубликован",
    },
  };
  return (
    <div>
      <Modal size="full" open={true}>
        <Modal.Header>
          {/* <Modal.Title
            style={{ textAlign: "center", width: "100%", display: "block" }}
          >
            <span style={{ textAlign: "center" }}>
              Извещение о проведении закупки (Конкурентный отбор)
            </span>
          </Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          {/* <Placeholder.Paragraph />
           */}
          <Panel shaded header="Извещение о проведении закупки № 1 (от)">
            <table className="table table-responsive table-bordered">
              <tbody>
                <tr>
                  <td style={{ width: "50%" }}>Номер процедуры</td>
                  <td style={{ width: "50%" }}>{data.number}</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>Статус</td>
                  <td style={{ width: "50%" }}>1</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>Тип процедуры</td>
                  <td style={{ width: "50%" }}>Конкурентный отбор</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    Наименование предмета закупки
                  </td>
                  <td style={{ width: "50%" }}>{data.name}</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    Начальная (максимальная) цена в рублях
                  </td>
                  <td style={{ width: "50%" }}>
                    {data.original_price.localeFormat({ style: "currency" })}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    Начальная (максимальная) цена за единицу в рублях
                  </td>
                  <td style={{ width: "50%" }}>
                    {data.bidding_per_unit_amount.localeFormat({
                      style: "currency",
                    })}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    Диапазон коэффициента снижения
                  </td>
                  <td style={{ width: "50%" }}>От 0 до 1</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    Количество публикуемых протоколов, согласно положению
                    Заказчика, более 1
                  </td>
                  <td style={{ width: "50%" }}>Да</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>Форма заключения договора</td>
                  <td style={{ width: "50%" }}>{data.contract_type}</td>
                </tr>
              </tbody>
            </table>

            <Panel shaded header="Опции процедуры">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td>Попозиционная закупка</td>
                    <td>Попозиционная закупка</td>
                  </tr>
                </tbody>
              </table>
            </Panel>
          </Panel>
        </Modal.Body>
        <Modal.Footer>
          <Link to="/procedure_edit/1">
            <Button appearance="subtle">Редактировать</Button>
          </Link>
          <a href={`https://dev.223.etpp.ru/procedure/${data.procedure_id}`}>
            <Button appearance="primary">Опубликовать</Button>
          </a>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShowResult;
