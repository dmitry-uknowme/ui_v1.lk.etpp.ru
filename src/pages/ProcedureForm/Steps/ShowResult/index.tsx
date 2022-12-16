import axios from "axios";
import React, { useContext, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Message,
  Modal,
  Panel,
  Placeholder,
  Table,
  toaster,
} from "rsuite";
import { FormGroupContext } from "rsuite/esm/FormGroup/FormGroup";
import LotPositionsTable from "../../../../components/Table/LotPositionsTable";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import fetchPurchasePlanPosition from "../../../../services/api/fetchPurchasePlanPosition";
import Money, { parseCurrency, parseDBMoney } from "../../../../utils/money";
import { useNavigate } from "react-router-dom";
import formatDate from "../../../../utils/formatDate";
import { API_V1_URL } from "../../../../services/api";
import currency from "currency.js";
import { parseDBAmount } from "../../../../utils/newMoney";

const LK_URL = import.meta.env.LK_URL;

interface ShowResultModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

const ShowResultModal: React.FC<ShowResultModalProps> = ({
  isOpen,
  setIsOpen,
  activeStep,
  setActiveStep,
}) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const [isBtnLoader, setBtnLoader] = useState<boolean>(false);
  const navigate = useNavigate();

  // console.log("procccccc 7", formGlobalValues);
  const procedureId = formGlobalServerData?.procedureId;
  const procedureNumber = formGlobalServerData?.procedureNumber;
  const noticeId = formGlobalServerData?.noticeId;
  const procedure = {
    ...formGlobalValues,
    id: procedureId,
    number: procedureNumber,
    notice_id: noticeId,
  };

  const lot = procedure?.lots?.length ? procedure?.lots[0] : null;
  const dateTime = lot?.date_time;

  if (!procedureId || !noticeId || !lot) {
    toaster.push(<Message type="error">Извещение не создано</Message>);
    setActiveStep(4);
    return;
  }

  const provisionBid = procedure.provision_bid;
  const provisionContract = procedure.provision_contract;
  const planId = formGlobalServerData?.purchasePlanId;
  const planPositionId = formGlobalValues?.plan_position_id;
  const cert_thumbprint = formGlobalServerData?.session?.cert_thumbprint;

  const purchasePlanPositionQuery = useQuery(
    ["purchasePlanPosition", planId, planPositionId],
    async () => {
      const planPosition = await fetchPurchasePlanPosition({
        planId,
        planPositionId,
      });

      return planPosition;
    },
    { enabled: !!(planId && planPositionId) }
  );

  const signAndSendNotice = async () => {
    setBtnLoader(true);
    const signlib = window.signlib;
    const { data: hashData } = await axios.get(
      `${API_V1_URL}/notice/${noticeId}/hash`
    );
    const hash = hashData.hash;

    try {
      const signData = await signlib.signStringHash(hash, cert_thumbprint);
      const sign = signData.sign;
      const formData = new FormData();
      formData.append("sign", sign);
      await axios.post(
        `${API_V1_URL}/notice/${noticeId}/sign-and-publish`,
        formData,
        { withCredentials: true }
      );

      return toaster.push(
        <Message type="success">
          Извещение успешно подписано и отправлено в ЕИС
        </Message>
      );
    } catch (err) {
      return toaster.push(
        <Message type="error">Ошибка при подписании извещения</Message>
      );
    } finally {
      setBtnLoader(false);
    }
  };

  const handleSubmit = () => {};

  const handleEdit = () => {
    setIsOpen(false);
    setActiveStep(5);
    window.history.pushState(
      null,
      null,
      `${LK_URL}/procedure/edit/new/${procedure.id}`
    );
    // window.history.pushState()
    // navigate(`/procedure_edit/${procedure.id}`);
  };

  return (
    <div>
      <Modal size="full" open={isOpen}>
        <Modal.Header>
          <Modal.Title
            style={{ textAlign: "center", width: "100%", display: "block" }}
          >
            <span style={{ textAlign: "center" }}>
              Извещение о проведении закупки (Конкурентный отбор)
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <Placeholder.Paragraph />
           */}
          <Panel shaded>
            <table className="table table-responsive table-bordered">
              <tbody>
                <tr>
                  <td style={{ width: "50%" }}>Номер процедуры</td>
                  <td style={{ width: "50%" }}>{procedure?.number}</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>Статус</td>
                  <td style={{ width: "50%" }}>
                    <Badge content="Черновик" color="blue" />
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>Тип процедуры</td>
                  <td style={{ width: "50%" }}>Конкурентный отбор</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    Наименование предмета закупки
                  </td>
                  <td style={{ width: "50%" }}>{procedure?.name}</td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    Начальная (максимальная) цена в рублях
                  </td>
                  <td style={{ width: "50%" }}>
                    {currency(parseDBAmount(procedure.original_price)).format({
                      style: "currency",
                    })}
                    {/* {currency(parseDBAmount(procedure.original_price)).format({
                      style: "currency",
                    })} */}
                  </td>
                </tr>
                {procedure?.bidding_per_unit_amount ? (
                  <tr>
                    <td style={{ width: "50%" }}>
                      Начальная (максимальная) цена за единицу в рублях
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.bidding_per_unit_amount
                        ? parseDBMoney(
                            procedure.bidding_per_unit_amount
                          ).localeFormat({
                            style: "currency",
                          })
                        : "Не предусмотрено"}
                      {/* {procedure?.bidding_per_unit_amount
                        ? currency(
                            parseDBAmount(procedure.bidding_per_unit_amount)
                          ).format({
                            style: "currency",
                          })
                        : "Не предусмотрено"} */}
                    </td>
                  </tr>
                ) : null}

                {procedure?.reduction_factor_purchase ? (
                  <tr>
                    <td style={{ width: "50%" }}>
                      Диапазон коэффициента снижения
                    </td>
                    <td style={{ width: "50%" }}>
                      От {procedure.reduction_factor_purchase_from} до{" "}
                      {procedure.reduction_factor_purchase_to}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td style={{ width: "50%" }}>
                    Количество публикуемых протоколов, согласно положению
                    Заказчика, более 1
                  </td>
                  <td style={{ width: "50%" }}>
                    {procedure?.more_than_one_protocol ? "Да" : "Нет"}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>Форма заключения договора</td>
                  <td style={{ width: "50%" }}>
                    {procedure?.contract_type === "ON_SITE"
                      ? "Электронная"
                      : "Бумажная"}
                  </td>
                </tr>
              </tbody>
            </table>
            <Panel shaded header="Опции процедуры">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "50%" }}>Закрытая закупка</td>
                    <td style={{ width: "50%" }}>Нет</td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>Торги за единицу</td>
                    <td style={{ width: "50%" }}>
                      {procedure?.bidding_per_unit ? "Да" : "Нет"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>Попозиционная закупка</td>
                    <td style={{ width: "50%" }}>
                      {procedure?.bidding_per_unit ? "Да" : "Нет"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>Коэффициент снижения</td>
                    <td style={{ width: "50%" }}>
                      {procedure?.reduction_factor_purchase ? "Да" : "Нет"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>

            <Panel shaded header="Этапы проведения">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Дата и время начала подачи заявок
                    </td>
                    <td style={{ width: "50%" }}>
                      {formatDate(new Date(dateTime.start_bids))}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Дата и время окончания подачи заявок
                    </td>
                    <td style={{ width: "50%" }}>
                      {formatDate(new Date(dateTime.close_bids))}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Дата и время рассмотрения и оценки заявок
                    </td>
                    <td style={{ width: "50%" }}>
                      {formatDate(new Date(dateTime.review_bids))}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Дата и время подведения итогов
                    </td>
                    <td style={{ width: "50%" }}>
                      {formatDate(new Date(dateTime.summing_up_end))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
            <Panel shaded header="Лот №1">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Сведения о позиции плана закупки:
                    </td>
                    <td style={{ width: "50%" }}>
                      План закупки № {formGlobalServerData?.purchasePlanNumber},
                      позиция плана {formGlobalServerData?.planPositionNumber}
                      {/* {dateTime.start_bids} */}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>Предмет договора</td>
                    <td style={{ width: "50%" }}>{procedure.name}</td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Начальная (максимальная) цена договора
                    </td>
                    <td style={{ width: "50%" }}>
                      {parseDBMoney(procedure.original_price).localeFormat({
                        style: "currency",
                      })}
                      {/* {parseDBMoney(procedure.original_price).localeFormat({
                        style: "currency",
                      })} */}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
            <Panel shaded header="Сведения о требованиях к процедуре">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "50%" }}>Вид обеспечения заявки</td>
                    <td style={{ width: "50%" }}>
                      {provisionBid?.methods?.length
                        ? provisionBid.methods[0] === "PERCENTAGE_AMOUNT"
                          ? "Процент от НМЦ (с внесением д/с на эл. площадку или банковская гарантия на эл. площадку)"
                          : provisionBid.methods[0] === "FIXED_AMOUNT"
                          ? "Фиксированная сумма (с внесением д/с на эл. площадку или банковская гарантия)"
                          : provisionBid.methods[0] === "WITHOUT_COLLATERAL"
                          ? "Без обеспечения"
                          : provisionBid.methods[0] ===
                            "ACCORDING_DOCUMENTATION"
                          ? "В соответствии с документацией"
                          : null
                        : null}
                    </td>
                  </tr>
                  {provisionBid?.amount ? (
                    <tr>
                      <td style={{ width: "50%" }}>
                        Размер обеспечения заявки
                      </td>
                      <td style={{ width: "50%" }}>
                        {parseDBMoney(provisionBid.amount).localeFormat({
                          style: "currency",
                        })}
                        {/* {currency(parseDBAmount(provisionBid.amount)).format()}
                         */}
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td style={{ width: "50%" }}>
                      Порядок предоставления обеспечения заявки
                    </td>
                    <td style={{ width: "50%" }}>
                      {provisionBid?.payment_return_deposit}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Вид обеспечения исполнения договора
                    </td>
                    <td style={{ width: "50%" }}>
                      {provisionContract?.type
                        ? provisionContract.type ==
                          "ACCORDING_PROCUREMENT_DOCUMENTS"
                          ? "В соответствии с закупочной документацией"
                          : provisionContract.type === "FROM_START_PRICE"
                          ? "От начальной цены лота"
                          : provisionContract.type === "FROM_CONTRACT_PRICE"
                          ? "От цены договора"
                          : null
                        : null}
                    </td>
                  </tr>
                  {provisionContract?.amount ? (
                    <tr>
                      <td style={{ width: "50%" }}>
                        Размер обеспечения исполнения договора
                      </td>
                      <td style={{ width: "50%" }}>
                        {parseDBMoney(provisionContract.amount).localeFormat({
                          style: "currency",
                        })}
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td style={{ width: "50%" }}>
                      Порядок предоставления обеспечения исполнения договора
                    </td>
                    <td style={{ width: "50%" }}>
                      {provisionContract?.payment_return_deposit}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
            <Panel shaded header="Требования к участникам закупки">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Требование об отсутствии сведений в РНП
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.requirement_not_rnp
                        ? "Не установлено"
                        : "Установлено"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Участниками закупки могут быть только субъекты малого и
                      среднего предпринимательства
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.is_for_smb ? "Установлено" : "Не установлено"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      В отношении участников закупки установлено требование о
                      привлечении к исполнению договора субподрядчиков
                      (соисполнителей) из числа субъектов малого и среднего
                      предпринимательства
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.is_subcontractor_requirement
                        ? "Установлено"
                        : "Не установлено"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
            <Panel shaded header="Порядок проведения закупки">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Порядок предоставления заявок на участие в закупке
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.other_info_by_customer}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Порядок рассмотрения заявок
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.order_review_and_summing_up}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Место рассмотрения заявок/подведения итогов
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.place_review_and_summing_up}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "100%" }} rowSpan={2}>
                      Торги проводятся на электронной торговой площадке "ЕТП
                      ТПП", находящейся в сети интернет по адресу{" "}
                      <a href="https://etpp.ru" target="_blank">
                        https://etpp.ru
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
            <Panel shaded header="Иные сведения о лоте">
              <table className="table table-responsive table-bordered">
                <tbody>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Иные требования установленные Заказчиком (Организатором
                      закупки)
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.other_info_by_customer}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Срок, место и порядок предоставления документации о
                      закупке
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.order_review_and_summing_up}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%" }}>
                      Сведения о порядке предоставления разъяснений на
                      документацию
                    </td>
                    <td style={{ width: "50%" }}>
                      {procedure.providing_documentation_explanation}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
            <Panel header="Перечень товаров, работ, услуг">
              <LotPositionsTable
                data={
                  purchasePlanPositionQuery.data?.positions?.length
                    ? purchasePlanPositionQuery.data.positions.map(
                        (position) => ({
                          ...position,
                          okpd_field: `${position.okpd_code}. ${position.okpd_name}`,
                          okved_field: `${position.okved_code}. ${position.okved_name}`,
                          qty: `${position.qty}, ${position.unit_name}`,
                          region: "Респ. Башкортостан",
                        })
                      )
                    : []
                }
                isLoading={purchasePlanPositionQuery.isLoading}
              />
            </Panel>
          </Panel>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" onClick={handleEdit}>
            Редактировать
          </Button>
          <Button
            appearance="primary"
            onClick={() => signAndSendNotice()}
            loading={isBtnLoader}
          >
            Опубликовать
          </Button>
          {/* </a> */}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShowResultModal;
