import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
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
import { API_V1_URL, LK_URL } from "../../../../services/api";
import currency from "currency.js";
import { parseDBAmount } from "../../../../utils/newMoney";
import fetchNoticeDocuments from "../../../../services/api/fetchNoticeDocuments";
import sendToast from "../../../../utils/sendToast";
import fetchLotPositions from "../../../../services/api/fetchLotPositions";
import { ProcedureFormActionVariants } from "../..";

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
  actionType

}) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);
  const [documents, setDocuments] = useState([]);
  const [isBtnLoader, setBtnLoader] = useState<boolean>(false);
  const navigate = useNavigate();
  const [positionsTableData, setPositionsTableData] = useState(formGlobalServerData?.positionsTableData?.length ? formGlobalServerData.positionsTableData : []);
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

  const organizer = procedure?.organizer;
  const customer = procedure?.customer;

  const lot = procedure?.lots?.length ? procedure?.lots[0] : null;

  console.log('tableeee', positionsTableData)
  const dateTime = lot?.date_time;
  if (!procedureId || !noticeId || !lot) {
    sendToast("error", "Извещение не создано")
    // toaster.push(<Message type="error">Извещение не создано</Message>);
    setActiveStep(4);
    return;
  }

  const provisionBid = procedure.provision_bid;
  const provisionContract = procedure.provision_contract;
  const planId = formGlobalServerData?.purchasePlanId;
  const planPositionId = formGlobalValues?.plan_position_id;
  const cert_thumbprint = formGlobalServerData?.session?.cert_thumbprint;

  const purchasePlanPositionQuery = useQuery(
    ["lotPositions"],
    async () => {
      const lotId = formGlobalServerData?.lotId ?? null;
      if (actionType === ProcedureFormActionVariants.EDIT && lotId) {
        const positions = await fetchLotPositions({ lotId });
        // console.log('positionssss', positions.map(pos => ({ ...pos, amount: `${pos?.price?.currency} ${pos?.price?.amount}` })))
        if (positions?.length && !positionsTableData.length) {
          setPositionsTableData(
            positions.map((pos) => ({
              ...pos,
              amount: `${currency(parseDBAmount(pos?.price?.amount) / 100)}`,
            }))
          );
          // return { positions: positions.map(pos => ({ ...pos, region: `${pos.region_name} ${pos.region_address}` })) }
        }
      }
    },
    {
      // refetchInterval: false,
      // refetchIntervalInBackground: false,
      // refetchOnWindowFocus: false,
      // refetchOnMount: false,
    }
  );
  // const purchasePlanPositionQuery = useQuery(
  //   ["purchasePlanPosition", planId, planPositionId],
  //   async () => {
  //     const planPosition = await fetchPurchasePlanPosition({
  //       planId,
  //       planPositionId,
  //     });

  //     return planPosition;
  //   },
  //   { enabled: !!(planId && planPositionId) }
  // );

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
      sendToast("success", "Извещение успешно подписано и отправлено в очередь на загрузку в ЕИС")

      // toaster.push(
      //   <Message type="success">
      //     Извещение успешно подписано и отправлено в очередь на загрузку в ЕИС
      //   </Message>
      // );
      setTimeout(() => {
        document.querySelector("#eisProcessLink")?.click();
      }, 1500);
    } catch (err) {
      sendToast("error", 'Ошибка при подписании извещения')
      // return toaster.push(
      //   <Message type="error">Ошибка при подписании извещения</Message>
      // );
    } finally {
      setTimeout(() => {
        setBtnLoader(false);
      }, 500);
    }
  };

  const handleSubmit = () => {
    signAndSendNotice();
  };

  const handleEdit = () => {
    setIsOpen(false);
    setActiveStep(5);
    document.querySelector("#editProcedureLink")?.click();

    // window.location.href = `${LK_URL}/procedure/edit/new/${procedure.id}`;
    // window.history.pushState(
    //   null,
    //   null,
    //   `${LK_URL}/procedure/edit/new/${procedure.id}`
    // );
    // window.history.pushState()

    // navigate(`/procedure_edit/${procedure.id}`);
  };
  const initDocuments = async () => {
    const serverDocuments = await fetchNoticeDocuments({ noticeId });
    setDocuments(serverDocuments);
  };

  useEffect(() => {
    initDocuments();
    // if (formGlobalServerData?.positionsTableData?.length && !positionsTableData.length) {
    //   setPositionsTableData(formGlobalServerData.positionsTableData)
    // }
  }, []);
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
                    {parseDBMoney(procedure.original_price).localeFormat({
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
                        ? parseDBMoney(procedure.bidding_per_unit_amount).localeFormat({
                          style: "currency",
                        })
                        // ? currency(
                        //   parseDBAmount(procedure.bidding_per_unit_amount)
                        // ).toString()
                        :
                        "Не предусмотрено"}

                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td style={{ width: "50%" }}>
                    НДС
                  </td>
                  <td style={{ width: "50%" }}>
                    {procedure?.lots[0].nds_type === 'NO_NDS' ? "Без НДС" : procedure?.lots[0].nds_type == "FIX_10" ? '10%' : procedure?.lots[0].nds_type === 'FIX_18' ? "18%" : procedure?.lots[0].nds_type === 'FIX_20' ? '20%' : procedure?.lots[0]?.nds_type}
                  </td>
                </tr>

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
                    {procedure?.more_than_one_protocol === true ? "Да" : "Нет"}
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
                      {procedure?.position_purchase ? "Да" : "Нет"}
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
                        ? "Установлено"
                        : "Не установлено"}
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
                    <td style={{ width: "100%" }} colSpan={2}>
                      Торги проводятся на электронной торговой площадке "ЕТП
                      ТПП", находящейся в сети интернет по адресу{" "}
                      <a href="https://etpp.ru" target="_blank">
                        https://etpp.ru
                      </a>
                    </td>
                    <td></td>
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
            <div className="row">
              <div className="col-md-6">
                <Panel header="Сведения об Организаторе">
                  <table className="table table-responsive table-bordered">
                    <tbody>
                      <tr>
                        <td style={{ width: "50%" }}>
                          Сокращенное наименование
                        </td>
                        <td style={{ width: "50%" }}>
                          {organizer?.short_title}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Полное наименование</td>
                        <td style={{ width: "50%" }}>
                          {organizer?.full_title}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>ИНН</td>
                        <td style={{ width: "50%" }}>{organizer?.inn}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>КПП</td>
                        <td style={{ width: "50%" }}>{organizer?.kpp}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Юридический адрес</td>
                        <td style={{ width: "50%" }}>
                          {organizer?.legal_address?.index}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Фактический адрес</td>
                        <td style={{ width: "50%" }}>
                          {organizer?.fact_address?.index}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>
                          Адрес электронной почты
                        </td>
                        <td style={{ width: "50%" }}>{organizer?.email}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Контактное лицо</td>
                        <td style={{ width: "50%" }}>
                          {organizer?.last_name} {organizer?.first_name}{" "}
                          {organizer?.middle_name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Номер телефона</td>
                        <td style={{ width: "50%" }}>{organizer?.phone}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>
                          Добавочный номер телефона
                        </td>
                        <td style={{ width: "50%" }}>
                          {organizer?.additional_phone}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Panel>
              </div>
              <div className="col-md-6">
                <Panel header="Сведения о Заказчике">
                  <table className="table table-responsive table-bordered">
                    <tbody>
                      <tr>
                        <td style={{ width: "50%" }}>
                          Сокращенное наименование
                        </td>
                        <td style={{ width: "50%" }}>
                          {customer?.short_title}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Полное наименование</td>
                        <td style={{ width: "50%" }}>{customer?.full_title}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>ИНН</td>
                        <td style={{ width: "50%" }}>{customer?.inn}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>КПП</td>
                        <td style={{ width: "50%" }}>{customer?.kpp}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Юридический адрес</td>
                        <td style={{ width: "50%" }}>
                          {customer?.legal_address?.index}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Фактический адрес</td>
                        <td style={{ width: "50%" }}>
                          {customer?.fact_address?.index}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>
                          Адрес электронной почты
                        </td>
                        <td style={{ width: "50%" }}>{customer?.email}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Контактное лицо</td>
                        <td style={{ width: "50%" }}>
                          {customer?.last_name} {customer?.first_name}{" "}
                          {customer?.middle_name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>Номер телефона</td>
                        <td style={{ width: "50%" }}>{customer?.phone}</td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%" }}>
                          Добавочный номер телефона
                        </td>
                        <td style={{ width: "50%" }}>
                          {customer?.additional_phone}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Panel>
              </div>
            </div>
            <Panel header="Перечень товаров, работ, услуг">
              <LotPositionsTable
                data={
                  positionsTableData?.length
                    ? positionsTableData.map((position) => ({
                      ...position,
                      okato:
                        position?.region_okato ||
                        purchasePlanPositionQuery?.data?.okato ||
                        null,
                      unit_name: position.unit_name,
                      okpd_field: `${position.okpd_code}. ${position.okpd_name} `,
                      okved_field: `${position.okved_code}. ${position.okved_name} `,
                      qty_count: position?.qty_count ? position.qty_count : `${position.qty || "Не определено"}, ${position.unit_name || "Не определено"
                        } `,
                      region: position?.region_address && (position?.region || position?.region_name) ? `${position?.region || position?.region_name} , ${position?.region_address}` : position.region_address,
                      // full_region: `${position?.region || position?.region_name} , ${position?.region_address
                      //   } `
                      // ,
                      address: position?.region_address
                    }))
                    : []
                }
                addPositions={(positions) => {
                  setFormGlobalValues((state) => ({
                    ...state,
                    lots: [
                      {
                        ...(formGlobalValues?.lots?.length
                          ? formGlobalValues.lots[0]
                          : {}),
                        plan_positions: [
                          ...(state?.lots[0]?.plan_positions?.length
                            ? state?.lots[0]?.plan_positions?.filter(
                              (pos) => pos.id !== positions.id
                            )
                            : []),
                          positions,
                        ],
                      },
                    ],
                  }));
                }}
                setPositionsTableData={setPositionsTableData}
                options={formGlobalServerData.options}
                isLoading={purchasePlanPositionQuery.isLoading}
              />
            </Panel>
            <Panel header="Документы извещения">
              <table className="table">
                <thead>
                  <tr>
                    <th>Наименование</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ verticalAlign: "middle" }}>
                        {doc.file_real_name}
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <Badge color="green" content={doc.status_localized} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Panel>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" onClick={handleEdit}>
            Редактировать
          </Button>

          <a
            className="d-none"
            id="eisProcessLink"
            href={`${LK_URL} / lot / notice / ${noticeId} / process`}
          // target="_blank"
          >
            Редактирование процедуры
          </a>
          <a
            className="d-none"
            id="editProcedureLink"
            href={`${LK_URL} / procedure / edit / new /${procedure.id}`}
          // target="_blank"
          >
            Процесс
          </a>
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
