import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Loader, Message, toaster } from "rsuite";
import { ProcedureFormActionVariants } from "../../pages/ProcedureForm";
import fetchProcedure from "../../services/api/fetchProcedure";
import fetchSession from "../../services/api/fetchSession";
import FormContext, { IMultiStepFormContext } from "./context";

interface MultiStepFormContextProviderProps {
  children: React.ReactNode;
  currentStepId: number;
  setCurrentStepId: React.Dispatch<React.SetStateAction<number>>;
  actionType: ProcedureFormActionVariants;
}

const MultiStepFormContextProvider: React.FC<
  MultiStepFormContextProviderProps
> = ({ children, currentStepId, setCurrentStepId, actionType }) => {
  const [formValues, setFormValues] = useState<
    IMultiStepFormContext["formValues"]
  >({});
  const [formErrors, setFormErrors] = useState<
    IMultiStepFormContext["formErrors"]
  >({});
  const [serverData, setServerData] = useState<
    IMultiStepFormContext["serverData"]
  >({});
  // const [currentStepId, setCurrentStepId] = useState<number>(0);
  const [isInited, setIsInited] = useState<boolean>(false);

  const initServerData = async () => {
    setIsInited(false);
    const session = await fetchSession();
    setServerData((state) => ({ ...state, session, actionType }));
    const savedFormContext = JSON.parse(localStorage.getItem("formContext"));

    if (savedFormContext) {
      const savedFormValues = savedFormContext.formValues;
      const activeStep = savedFormContext.currentStepId;
      const savedServerData = savedFormContext?.serverData;
      const savedProcedureId = savedServerData?.procedureId;
      const savedFormType = savedServerData?.actionType;
      const savedSession = savedServerData?.session
      if (
        (savedFormType && (savedFormType === actionType)) ||
        (savedProcedureId && (savedProcedureId === procedureId))
      ) {
        if (savedFormValues) {
          setFormValues(savedFormValues);
        }
        if (activeStep) {
          setCurrentStepId(activeStep);
        }
        if (savedServerData) {
          setServerData(savedServerData);
        }

        if (savedSession.profile_id !== session.profile_id) {
          setServerData(state => ({ ...state, session }))
        }
      }
    }
    setIsInited(true);
  };

  useEffect(() => {
    if (isInited) {
      const session = serverData.session;
      if (!session || !session?.profile_id) {
        toaster.push(
          <Message type="error">Пользователь не авторизован</Message>
        );
      }
      if (!session?.cert_thumbprint) {
        toaster.push(
          <Message type="error">Не найден активный отпечаток подписи</Message>
        );
      }
      // }
    }
  }, [serverData, isInited]);

  useEffect(() => {
    initServerData();
  }, []);

  const params = useParams();

  const procedureId = params?.procedure_id;

  const { data: procedureData } = useQuery(
    ["procedure", procedureId],
    async () => await fetchProcedure({ procedureId }),
    {
      refetchInterval: false,
      enabled: !!(
        procedureId && actionType === ProcedureFormActionVariants.EDIT
      ),
      onError: (err) =>
        toaster.push(<Message type="error">404. Процедура не найдена</Message>),
    }
  );

  useEffect(() => {
    if (actionType === ProcedureFormActionVariants.EDIT) {
      if (!procedureId) {
        toaster.push(<Message type="error">404. Процедура не найдена</Message>);
      }
    }
  }, []);

  useEffect(() => {
    if (procedureData) {
      const procedure = procedureData;
      const organizer = procedure.organizer;
      const customer = procedure.customer;
      const lot = procedure.lots[0];
      const provisionBid = procedure.provision_bid;
      const provisionContract = procedure.provision_contract;
      // console.log("ssssss", procedure, lot);
      setServerData((state) => ({
        ...state,
        provision_bid: {
          amount: `${provisionBid.amount.currency} ${provisionBid.amount.amount}`,
          percent: provisionBid.percent,
        },
        provision_contract: {
          amount: `${provisionContract.amount.currency} ${provisionContract.amount.amount}`,
          percent: provisionContract.percent,
        },
        actionType: actionType,
        procedureId: procedure.id,
        noticeId: procedure?.notices?.length ? procedure.notices[0].id : null,
        lotId: procedure?.lots?.length ? procedure.lots[0].id : null,
      }));
      setFormValues((state) => ({
        ...state,
        name: procedure.name,
        plan_position_id: lot?.plan_position_id ? lot.plan_position_id : null,
        original_price: `${procedure.price_original.currency} ${procedure.price_original.amount}`,
        bidding_per_unit_amount: procedure.bidding_per_unit
          ? `${lot.unit_price.currency} ${lot.unit_price.amount}`
          : null,
        organizer: {
          inn: organizer.inn,
          short_title: organizer.inn,
          full_title: organizer.full_title,
          phone: organizer.phone_number,
          email: organizer.email,
          kpp: organizer.kpp,
          ogrn: organizer.ogrn,
          last_name: organizer.last_name,
          first_name: organizer.first_name,
          middle_name: organizer.middle_name,
          legal_address: { index: organizer.legal_address },
          fact_address: { index: organizer.fact_address },
          additional_phone: organizer.phone_extra_number,
          subject_type: "INDIVIDUAL_ENTREPRENEUR",
        },
        customer: {
          inn: customer.inn,
          short_title: customer.short_title,
          full_title: customer.full_title,
          phone: customer.phone_number,
          email: customer.email,
          kpp: customer.kpp,
          ogrn: customer.ogrn,
          last_name: customer.last_name,
          first_name: customer.first_name,
          middle_name: customer.middle_name,
          legal_address: { index: customer.legal_address },
          fact_address: { index: customer.fact_address },
          additional_phone: customer.phone_extra_number,
          subject_type: "INDIVIDUAL_ENTREPRENEUR",
        },
        lots: [
          {
            nds_type: procedure.nds_type,
            plan_positions: [],
            positions: [],
            date_time: {
              start_bids: lot.start_bid_date,
              close_bids: lot.close_bid_date,
              review_bids: lot.close_bid_date,
              summing_up_end: lot.summing_up_date,
            },
            name: procedure.name,
            starting_price: `${procedure.price_original.currency} ${procedure.price_original.amount}`,
          },
        ],
        provision_bid: {
          amount: `${provisionBid.amount.currency} ${provisionBid.amount.amount}`,
          is_specified: provisionBid.is_specified,
          methods: provisionBid.methods,
          payment_return_deposit: null,
        },
        provision_contract: {
          amount: `${provisionContract.amount.currency} ${provisionContract.amount.amount}`,
          is_specified: provisionContract.is_specified,
          // methods: provisionContract.methods,
          percent: provisionContract.percent,
          type: provisionContract.type,
          payment_return_deposit: null,
        },
        is_subcontractor_requirement: procedure.requirements.subcontractor,
        is_for_smb: procedure.requirements.only_for_smb,
        requirement_not_rnp: procedure.requirements.rnp,
        bidding_per_unit: procedure.bidding_per_unit,
        position_purchase: procedure.bidding_per_position_option,
        bidding_process: procedure.bidding_process,
        order_review_and_summing_up: procedure.order_review_and_summing_up,
        place_review_and_summing_up: procedure.place_review_and_summing_up,
        procedure_process: procedure.procedure_process,
        info_trading_venue: procedure.info_trading_venue,
        requirements_participant: procedure.requirements_participant,
        providing_documentation_explanation:
          procedure.providing_documentation_explanation,
        other_info_by_customer: procedure.other_info_by_customer,
        provision_procurement_documentation:
          procedure.provision_procurement_documentation,
        bid_part: procedure.bid_part,
        contract_by_any_participant: true,
        // contract_by_any_participant: procedure.contract_by_any_participant,
        contract_type: procedure.contract_type,
        currency: procedure.currency,
        currency_rate: 1,
        // currency_rate: procedure.currency_rate,
        currency_rate_date: procedure.currency_rate_date,
        criteria_evaluation: null,
        count_participant_ranked_lower_than_first: null,
        is_rebidding: true,


        more_than_one_protocol: procedure.more_than_one_protocol,
        platform: procedure.platform_type,
        reduction_factor_purchase: procedure.reduction_factor_purchase,
        reduction_factor_purchase_from: procedure.reduction_factor_purchase_from,
        reduction_factor_purchase_to: procedure.reduction_factor_purchase_to
      }));
      // setServerData(state => ({ ...state, procedureId: procedure.id }))
    }
  }, [procedureData]);

  useEffect(() => {
    if (isInited) {
      console.log("saveddd", formValues);
      setTimeout(() => {
        localStorage.setItem(
          "formContext",
          JSON.stringify({
            formValues,
            serverData,
            currentStepId,
          })
        );
      }, 500);
    }
  }, [formValues, serverData]);

  return (
    <>
      {isInited ? <FormContext.Provider
        value={{
          formValues,
          setFormValues,
          formErrors,
          setFormErrors,
          serverData,
          setServerData,
          currentStepId,
          setCurrentStepId,
        }}
      >
        {children}
      </FormContext.Provider> : <Loader size="lg" />}
    </>
  );
};

export default MultiStepFormContextProvider