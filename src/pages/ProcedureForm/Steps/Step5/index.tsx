import {
  Form,
  Button,
  CheckboxGroup,
  Checkbox,
  Schema,
  Panel,
  Message,
  toaster,
  Input,
  Animation,
  SelectPicker,
} from "rsuite";
import React, { useContext, useEffect, useState } from "react";
import PurchasePlanTable from "../../../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import MultiStepFormContext from "../../../../context/multiStepForm/context";
import fetchProfileOrganizations from "../../../../services/api/fetchProfileOrganizations";
import axios from "axios";
import createProcedure from "../../../../services/api/createProcedure";
import updateProcedure from "../../../../services/api/updateProcedure";
import fetchOrganizationEmployees from "../../../../services/api/fetchOrganizationEmployees";
import fetchOrganizationEmployee from "../../../../services/api/fetchOrganizationEmployee";
import { ProcedureFormActionVariants } from "../..";
import fetchProfile from "../../../../services/api/fetchProfile";
import sendToast from "../../../../utils/sendToast";

const Field = React.forwardRef((props, ref) => {
  const { name, message, label, accepter, error, ...rest } = props;
  return (
    <Form.Group
      controlId={`${name}-10`}
      ref={ref}
      className={error ? "has-error" : ""}
    >
      <Form.ControlLabel>{label} </Form.ControlLabel>
      <Form.Control
        name={name}
        accepter={accepter}
        errorMessage={error}
        {...rest}
      />
      {message ? <Form.HelpText>{message}</Form.HelpText> : null}
    </Form.Group>
  );
});

const { ArrayType, NumberType, StringType } = Schema.Types;
const model = Schema.Model({
  organizer_org_full_name: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_org_short_name: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_org_inn: StringType().isRequired("Поле обязательно для заполнения"),
  organizer_org_kpp: StringType().isRequired("Поле обязательно для заполнения"),
  organizer_org_ogrn: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_org_legal_address: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_org_fact_address: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_representative_id: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_representative_surname: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_representative_name: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_representative_lastname: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_representative_phone: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  organizer_representative_email: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_org_full_name: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_org_short_name: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_org_inn: StringType().isRequired("Поле обязательно для заполнения"),
  customer_org_kpp: StringType().isRequired("Поле обязательно для заполнения"),
  customer_org_ogrn: StringType().isRequired("Поле обязательно для заполнения"),
  customer_org_legal_address: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_org_fact_address: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_representative_surname: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_representative_name: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_representative_lastname: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_representative_phone: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
  customer_representative_email: StringType().isRequired(
    "Поле обязательно для заполнения"
  ),
});

const Step5 = ({ currentStep, setCurrentStep, nextStep, prevStep }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  const procedureId = formGlobalServerData.procedureId;
  const session = formGlobalServerData.session;
  const profileId = formGlobalServerData?.session?.profile_id;

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    isOrganizerEqualsCustomer: [],
    organizer_id: formGlobalServerData?.organizerId || "",
    organizer_org_full_name: formGlobalValues?.organizer?.full_title || "",
    organizer_org_short_name: formGlobalValues?.organizer?.short_title || "",
    organizer_org_inn: formGlobalValues?.organizer?.inn || "",
    organizer_org_kpp: formGlobalValues?.organizer?.kpp || "",
    organizer_org_ogrn: formGlobalValues?.organizer?.ogrn || "",
    organizer_org_legal_address:
      formGlobalValues?.organizer?.legal_address?.index || "",
    organizer_org_fact_address:
      formGlobalValues?.organizer?.fact_address?.index || "",
    organizer_representative_id:
      formGlobalServerData?.organizerRepresentativeId || "",
    organizer_representative_surname:
      formGlobalValues?.organizer?.middle_name || "",
    organizer_representative_name:
      formGlobalValues?.organizer?.first_name || "",
    organizer_representative_lastname:
      formGlobalValues?.organizer?.last_name || "",
    organizer_representative_phone: formGlobalValues?.organizer?.phone || "",
    organizer_representative_email: formGlobalValues?.organizer?.email || "",
    organizer_representative_phone_extra:
      formGlobalValues?.organizer?.additional_phone || "",
    customer_id: formGlobalServerData?.customerId || "",
    customer_org_full_name: formGlobalValues?.customer?.full_title || "",
    customer_org_short_name: formGlobalValues?.customer?.short_title || "",
    customer_org_inn: formGlobalValues?.customer?.inn || "",
    customer_org_kpp: formGlobalValues?.customer?.kpp || "",
    customer_org_ogrn: formGlobalValues?.customer?.ogrn || "",
    customer_org_legal_address:
      formGlobalValues?.customer?.legal_address?.index || "",
    customer_org_fact_address:
      formGlobalValues?.customer?.fact_address?.index || "",
    customer_representative_id:
      formGlobalServerData?.customerRepresentativeId || "",
    customer_representative_surname:
      formGlobalValues?.customer?.middle_name || "",
    customer_representative_name: formGlobalValues?.organizer?.first_name || "",
    customer_representative_lastname:
      formGlobalValues?.organizer?.last_name || "",
    customer_representative_phone: formGlobalValues?.organizer?.phone || "",
    customer_representative_email: formGlobalValues?.organizer?.email || "",
    customer_representative_phone_extra:
      formGlobalValues?.organizer?.additional_phone || "",
  });

  const isErrorsExists = !!Object.keys(formError)?.length;

  const profileOrganizationsQuery = useQuery(
    "profileOrganizations",
    async () => {
      let organizations = await fetchProfileOrganizations({ profileId });
      const currentOrganization = await fetchProfile({ profileId });
      organizations = [...organizations, currentOrganization];
      if (organizations?.length) {
        if (!formValue.organizer_id?.trim()?.length) {
          const selectOrganizerOrganization =
            organizations.find(
              (org) => org.id === formGlobalServerData?.organizerId
            ) || organizations[0];
          console.log("organizationss sett", organizations);
          setFormValue((state) => ({
            ...state,
            organizer_id: selectOrganizerOrganization.id,
            organizer_org_full_name:
              selectOrganizerOrganization.full_title_organization,
            organizer_org_short_name:
              selectOrganizerOrganization.short_title_organization,
            organizer_org_inn: selectOrganizerOrganization.inn,
            organizer_org_kpp: selectOrganizerOrganization.kpp,
            organizer_org_ogrn: selectOrganizerOrganization.ogrn,
            organizer_org_fact_address:
              selectOrganizerOrganization.fact_address,
            organizer_org_legal_address:
              selectOrganizerOrganization.legal_address,
          }));
        }
        if (!formValue.customer_id?.trim()?.length) {
          const selectCustomerOrganization =
            organizations.find(
              (org) => org.id === formGlobalServerData?.customerId
            ) || organizations[0];

          setFormValue((state) => ({
            ...state,
            customer_id: selectCustomerOrganization.id,
            customer_org_full_name:
              selectCustomerOrganization.full_title_organization,
            customer_org_short_name:
              selectCustomerOrganization.short_title_organization,
            customer_org_inn: selectCustomerOrganization.inn,
            customer_org_kpp: selectCustomerOrganization.kpp,
            customer_org_ogrn: selectCustomerOrganization.ogrn,
            customer_org_fact_address: selectCustomerOrganization.fact_address,
            customer_org_legal_address:
              selectCustomerOrganization.legal_address,
          }));
        }
        return organizations;
      }
    },
    { refetchInterval: false }
  );

  const organizerEmployeesQuery = useQuery(
    ["organizerEmployees", formValue.organizer_id],
    async () => {
      const employees = await fetchOrganizationEmployees(
        formValue.organizer_id
      );
      if (employees?.length) {
        const selectEmployeeId =
          formGlobalServerData?.organizerRepresentativeId || employees[0].id;
        setFormValue((state) => ({
          ...state,
          organizer_representative_id: selectEmployeeId,
        }));
      }
      return employees;
    },
    {
      enabled:
        formValue.organizer_id?.trim()?.length &&
          formValue.organizer_id !== "MANUAL_INPUT"
          ? true
          : false,
      refetchInterval: false,
    }
  );

  const customerEmployeesQuery = useQuery(
    ["customerEmployees", formValue.customer_id],
    async () => {
      const employees = await fetchOrganizationEmployees(formValue.customer_id);

      if (employees?.length) {
        const selectEmployeeId =
          formGlobalServerData?.customerRepresentativeId || employees[0].id;
        setFormValue((state) => ({
          ...state,
          customer_representative_id: selectEmployeeId,
        }));
      }
      return employees;
    },
    {
      enabled:
        formValue.customer_id?.trim()?.length &&
          formValue.customer_id !== "MANUAL_INPUT"
          ? true
          : false,
      refetchInterval: false,
    }
  );

  // const currentOrganizerOrganization = profileOrganizationsQuery?.data ?? null;
  // const currentOrganizerOrganization = profileOrganizationsQuery?.data?.length
  //   ? profileOrganizationsQuery.data.find(
  //       (org) => org.id === formValue.organizer_id
  //     )
  //   : null;
  const organizerEmployeeQuery = useQuery(
    ["organizerEmployee", formValue.organizer_representative_id],
    async () => {
      const employee = await fetchOrganizationEmployee(
        formValue.organizer_representative_id
      );
      if (employee) {
        setFormValue((state) => ({
          ...state,
          organizer_representative_name: employee.full_name_first_name,
          organizer_representative_surname: employee.full_name_last_name,
          organizer_representative_lastname: employee.full_name_middle_name,
          organizer_representative_email: employee.email,
          organizer_representative_phone: employee.phone,
          organizer_representative_phone_extra: employee.additional_phone,
        }));
      }
      return employee;
    },
    {
      enabled:
        formValue?.organizer_representative_id?.trim()?.length &&
          formValue?.organizer_representative_id !== "MANUAL_INPUT"
          ? true
          : false,
      refetchInterval: false,
    }
  );

  const customerEmployeeQuery = useQuery(
    ["customerEmployee", formValue.customer_representative_id],
    async () => {
      const employee = await fetchOrganizationEmployee(
        formValue.customer_representative_id
      );
      if (employee) {
        setFormValue((state) => ({
          ...state,
          customer_representative_name: employee.full_name_first_name,
          customer_representative_surname: employee.full_name_last_name,
          customer_representative_lastname: employee.full_name_middle_name,
          customer_representative_email: employee.email,
          customer_representative_phone: employee.phone,
          customer_representative_phone_extra: employee.additional_phone,
        }));
      }
      return employee;
    },
    {
      enabled:
        formValue.customer_representative_id?.trim()?.length &&
          formValue.customer_representative_id !== "MANUAL_INPUT"
          ? true
          : false,
      refetchInterval: false,
    }
  );

  const currentOrganizerEmployee = organizerEmployeeQuery.data;
  const currentCustomerEmployee = customerEmployeeQuery.data;

  const isOrganizerManualInput = formValue.organizer_id === "MANUAL_INPUT";
  const isSubOrganizerManualInput =
    formValue.organizer_representative_id === "MANUAL_INPUT";
  const isCustomerManualInput = formValue.customer_id === "MANUAL_INPUT";
  const isSubCustomerManualInput =
    formValue.customer_representative_id === "MANUAL_INPUT";
  formValue.customer_representative_id === "MANUAL_INPUT";
  const isOrganizerEqualsCustomer =
    formValue.isOrganizerEqualsCustomer.includes("EQUAL");

  const handleSubmit = async () => {
    console.log("vvvv", formValue);
    if (isOrganizerEqualsCustomer) {
      setFormValue((state) => ({
        ...state,
        customer_id: state.organizer_id,
        customer_org_ogrn: state.organizer_org_ogrn,
        customer_representative_id: state.organizer_representative_id,
        customer_representative_name: state.organizer_representative_name,
        customer_representative_lastname:
          state.organizer_representative_lastname,
        customer_representative_surname: state.organizer_representative_surname,
        customer_representative_email: state.organizer_representative_email,
        customer_representative_phone: state.organizer_representative_phone,
        customer_representative_phone_extra:
          state.organizer_representative_phone_extra,
        customer_org_inn: state.organizer_org_inn,
        customer_org_kpp: state.organizer_org_kpp,
        customer_org_short_name: state.organizer_org_short_name,
        customer_org_full_name: state.organizer_org_full_name,
        customer_org_legal_address: state.organizer_org_legal_address,
        customer_org_fact_address: state.organizer_org_fact_address,
      }));
    }
    const finalData = {
      lots: [
        {
          ...(formGlobalValues?.lots?.length
            ? formGlobalValues.lots[0]
            : {}),
          plan_positions: formGlobalValues?.lots[0]?.plan_positions?.length ? formGlobalValues?.lots[0]?.plan_positions : [],
        },

      ],
      customer: {
        ogrn: formValue.customer_org_ogrn,
        first_name: formValue.customer_representative_name,
        last_name: formValue.customer_representative_lastname,
        middle_name: formValue.customer_representative_surname,
        email: formValue.customer_representative_email,
        phone: formValue.customer_representative_phone,
        additional_phone:
          formValue.customer_representative_phone_extra?.trim() === ""
            ? null
            : formValue.customer_representative_phone_extra,
        // additional_phone:
        //   formValue.customer_representative_phone_extra.trim() === ""
        //     ? null
        //     : formValue.customer_representative_phone_extra,
        inn: formValue.customer_org_inn,
        kpp: formValue.customer_org_kpp,
        short_title: formValue.customer_org_short_name,
        full_title: formValue.customer_org_full_name,
        subject_type: "INDIVIDUAL_ENTREPRENEUR",
        legal_address: {
          index: formValue.customer_org_legal_address,
        },
        fact_address: {
          index: formValue.customer_org_fact_address,
        },
      },
      organizer: {
        ogrn: formValue.organizer_org_ogrn,
        first_name: formValue.organizer_representative_name,
        last_name: formValue.organizer_representative_lastname,
        middle_name: formValue.organizer_representative_surname,
        email: formValue.organizer_representative_email,
        phone: formValue.organizer_representative_phone,
        additional_phone:
          formValue.organizer_representative_phone_extra?.trim() === ""
            ? null
            : formValue.organizer_representative_phone_extra,
        // additional_phone:
        //   formValue.organizer_representative_phone_extra.trim() === ""
        //     ? null
        //     : formValue.organizer_representative_phone_extra,
        inn: formValue.organizer_org_inn,
        kpp: formValue.organizer_org_kpp,
        short_title: formValue.organizer_org_short_name,
        full_title: formValue.organizer_org_full_name,
        subject_type: "INDIVIDUAL_ENTREPRENEUR",
        legal_address: {
          index: formValue.organizer_org_legal_address,
        },
        fact_address: {
          index: formValue.organizer_org_fact_address,
        },
      },
    };

    if (!formRef.current.check()) {
      sendToast("error", "Пожалуйста, исправьте ошибки перед тем, как перейте на следующий шаг")
      // toaster.push(
      //   <Message type="error">
      //     Пожалуйста, исправьте ошибки перед тем, как перейте на следующий шаг
      //   </Message>
      // );
      // toaster.push(
      //   <Message type="error">
      //     Пожалуйста, исправьте ошибки перед тем, как перейте на следующий шаг
      //   </Message>
      // );
      document
        .querySelector(".rs-form-group .rs-form-error-message")
        ?.parentNode?.parentNode?.scrollIntoView();
      return;
    }
    setFormGlobalServerData((state) => ({
      ...state,
      organizerId: formValue.organizer_id,
      customerId: formValue.customer_id,
      organizerRepresentativeId: formValue.organizer_representative_id,
      customerRepresentativeId: formValue.customer_representative_id,
    }));
    setFormGlobalValues((state) => ({
      ...state,
      ...formGlobalValues,
      ...finalData,
    }));
    if (
      formGlobalServerData.actionType === ProcedureFormActionVariants.EDIT ||
      formGlobalServerData.procedureId
    ) {
      const procedureData = await updateProcedure(
        procedureId,
        { ...finalData, ...formGlobalValues },
        (err) => {
          sendToast("error", `Ошибка при обновлении процедуры ${JSON.stringify(err, null, 2)}`)
          return
          // toaster.push(
          //   <Message type="error">
          //     Ошибка при создании процедуры {JSON.stringify(err, null, 2)}
          //   </Message>
          // );
        }
      );
      if (procedureData) {
        console.log("update procedureeeeee", procedureData);
        // setFormGlobalServerData((state) => ({
        //   ...state,
        //   procedure: procedureData,
        // }));
        // toaster.push(
        //   <Message type="success">Процедура успешно создана</Message>
        // );
        const noticeId = procedureData.notice_id;
        setFormGlobalServerData((state) => ({
          ...state,
          noticeId,
          procedure: procedureData.procedure,
        }));
        nextStep();
      }
    } else {
      const procedureData = await createProcedure(
        { ...finalData, ...formGlobalValues },
        (err) => {
          sendToast("error", `Ошибка при создании процедуры ${JSON.stringify(err, null, 2)}`)
          return
          // toaster.push(
          //   <Message type="error">
          //     Ошибка при создании процедуры {JSON.stringify(err, null, 2)}
          //   </Message>
          // );
        }
      );
      if (procedureData) {
        console.log("created procedureeeeee", procedureData.procedure);
        sendToast("success", "Извещение успешно создано")

        // toaster.push(
        //   <Message type="success">Извещение успешно создано</Message>
        // );
        const noticeId = procedureData.notice_id;
        const procedureId = procedureData.procedure.guid.value;
        const procedureNumber = procedureData.procedure.id;
        setFormGlobalServerData((state) => ({
          ...state,
          noticeId,
          procedure: procedureData.procedure,
          procedureId,
          procedureNumber,
        }));

        nextStep();
      }
    }
  };

  useEffect(() => {
    if (formValue.organizer_id) {
      console.log("change o iiddd", formValue.organizer_id);
      const selectOrganizerOrganization = profileOrganizationsQuery?.data?.find(
        (org) => org.id === formValue.organizer_id
      );
      if (selectOrganizerOrganization) {
        console.log("select o", selectOrganizerOrganization);
        setFormValue((state) => ({
          ...state,
          organizer_org_full_name:
            selectOrganizerOrganization.full_title_organization,
          organizer_org_short_name:
            selectOrganizerOrganization.short_title_organization,
          organizer_org_inn: selectOrganizerOrganization.inn,
          organizer_org_kpp: selectOrganizerOrganization.kpp,
          organizer_org_ogrn: selectOrganizerOrganization.ogrn,
          organizer_org_fact_address: selectOrganizerOrganization.fact_address,
          organizer_org_legal_address:
            selectOrganizerOrganization.legal_address,
        }));
      }
    }
  }, [formValue.organizer_id]);

  useEffect(() => {
    if (formValue.customer_id) {
      console.log("change c iiddd", formValue.customer_id);
      const selectCustomerOrganization = profileOrganizationsQuery?.data?.find(
        (org) => org.id === formValue.customer_id
      );
      if (selectCustomerOrganization) {
        console.log("select c", selectCustomerOrganization);
        setFormValue((state) => ({
          ...state,
          customer_org_full_name:
            selectCustomerOrganization.full_title_organization,
          customer_org_short_name:
            selectCustomerOrganization.short_title_organization,
          customer_org_inn: selectCustomerOrganization.inn,
          customer_org_kpp: selectCustomerOrganization.kpp,
          customer_org_ogrn: selectCustomerOrganization.ogrn,
          customer_org_fact_address: selectCustomerOrganization.fact_address,
          customer_org_legal_address: selectCustomerOrganization.legal_address,
        }));
      }
    }
  }, [formValue.customer_id]);

  return (
    <div className="col-md-9">
      <Form
        ref={formRef}
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        model={model}
      >
        <Field
          name="isOrganizerEqualsCustomer"
          label=""
          accepter={CheckboxGroup}
          error={formError.options}
        >
          <Checkbox value={"EQUAL"}>
            Заказчик и организатор в одном лице
          </Checkbox>
        </Field>
        <div className="d-flex">
          <Panel
            header={`Сведения об организаторе ${isOrganizerEqualsCustomer ? "и заказчике" : ""
              }`}
          >
            <Panel>
              <Field
                name="organizer_id"
                label="Организация"
                accepter={SelectPicker}
                error={formError.procedure_section}
                data={
                  profileOrganizationsQuery.isError ||
                    !profileOrganizationsQuery?.data?.length
                    ? [{ label: "Заполнить вручную", value: "MANUAL_INPUT" }]
                    : [
                      ...profileOrganizationsQuery?.data?.map((org) => ({
                        value: org.id,
                        label: org.short_title_organization,
                      })),

                      { label: "Заполнить вручную", value: "MANUAL_INPUT" },
                    ]
                }
                value={formValue.organizer_id}
                loading={profileOrganizationsQuery.isLoading}
                placeholder="Выберите"
              />
              <Animation.Collapse
                in={isOrganizerManualInput || isErrorsExists}
                timeout={500}
              >
                <div>
                  <Field
                    name="organizer_org_full_name"
                    label="Полное наименование организации"
                    accepter={Input}
                    error={formError.organizer_org_full_name}
                    value={formValue.organizer_org_full_name}
                  />
                  <Field
                    name="organizer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    error={formError.organizer_org_short_name}
                    value={formValue.organizer_org_short_name}
                  />
                  <Field
                    name="organizer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    error={formError.organizer_org_inn}
                    value={formValue.organizer_org_inn}
                  />
                  <Field
                    name="organizer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    error={formError.organizer_org_kpp}
                    value={formValue.organizer_org_kpp}
                  />
                  <Field
                    name="organizer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    error={formError.organizer_org_ogrn}
                    value={formValue.organizer_org_ogrn}
                  />
                  <Field
                    name="organizer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    error={formError.organizer_org_legal_address}
                    value={formValue.organizer_org_legal_address}
                  />
                  <Field
                    name="organizer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    error={formError.organizer_org_fact_address}
                    value={formValue.organizer_org_fact_address}
                  />
                  <hr />
                </div>
              </Animation.Collapse>
              <Field
                name="organizer_representative_id"
                label="Контактное лицо"
                accepter={SelectPicker}
                preventOverflow
                error={formError.procedure_section}
                data={
                  organizerEmployeesQuery.isError ||
                    !organizerEmployeesQuery?.data?.length
                    ? [{ label: "Заполнить вручную", value: "MANUAL_INPUT" }]
                    : [
                      ...organizerEmployeesQuery?.data?.map((emp) => ({
                        label: emp.user_name || "Сотрудник",
                        value: emp.id,
                      })),
                      { label: "Заполнить вручную", value: "MANUAL_INPUT" },
                    ]
                }
                loading={organizerEmployeesQuery.isLoading}
                placeholder="Выберите"
              />
              <Animation.Collapse
                in={isSubOrganizerManualInput || isErrorsExists}
              >
                <div>
                  <Field
                    name="organizer_representative_lastname"
                    label="Фамилия"
                    accepter={Input}
                    error={formError.organizer_representative_lastname}
                    value={formValue.organizer_representative_lastname}
                  />
                  <Field
                    name="organizer_representative_name"
                    label="Имя"
                    accepter={Input}
                    error={formError.organizer_representative_name}
                    value={formValue.organizer_representative_name}
                  />
                  <Field
                    name="organizer_representative_surname"
                    label="Отчество"
                    accepter={Input}
                    error={formError.organizer_representative_surname}
                    value={formValue.organizer_representative_surname}
                  />
                  <Field
                    name="organizer_representative_email"
                    label="Email"
                    accepter={Input}
                    error={formError.organizer_representative_email}
                    value={formValue.organizer_representative_email}
                  />
                  <Field
                    name="organizer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    error={formError.organizer_representative_phone}
                    value={formValue.organizer_representative_phone}
                  />
                  <Field
                    name="organizer_representative_phone_extra"
                    label="Добавочный номер телефона"
                    accepter={Input}
                    error={formError.organizer_representative_phone_extra}
                    value={formValue.organizer_representative_phone_extra}
                  />
                </div>
              </Animation.Collapse>
            </Panel>
          </Panel>
          <Panel
            header={`Сведения о заказчике`}
            style={
              isOrganizerEqualsCustomer
                ? {
                  width: 0,
                  height: 0,
                  overflow: "hidden",
                }
                : {}
            }
          >
            <Panel>
              <Field
                name="customer_id"
                label="Организация"
                accepter={SelectPicker}
                error={formError.procedure_section}
                data={
                  profileOrganizationsQuery.isError ||
                    !profileOrganizationsQuery?.data?.length
                    ? [{ label: "Заполнить вручную", value: "MANUAL_INPUT" }]
                    : [
                      ...profileOrganizationsQuery?.data?.map((org) => ({
                        value: org.id,
                        label: org.short_title_organization,
                      })),

                      { label: "Заполнить вручную", value: "MANUAL_INPUT" },
                    ]
                }
                value={formValue.customer_id}
                loading={profileOrganizationsQuery.isLoading}
                placeholder="Выберите"
              />
              <Animation.Collapse
                in={isCustomerManualInput || isErrorsExists}
                timeout={500}
              >
                <div>
                  <Field
                    name="customer_org_full_name"
                    label="Полное наименование организации"
                    accepter={Input}
                    error={formError.customer_org_full_name}
                    value={formValue.customer_org_full_name}
                  />
                  <Field
                    name="customer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    error={formError.customer_org_short_name}
                    value={formValue.customer_org_short_name}
                  />
                  <Field
                    name="customer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    error={formError.customer_org_inn}
                    value={formValue.customer_org_inn}
                  />
                  <Field
                    name="customer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    error={formError.customer_org_kpp}
                    value={formValue.customer_org_kpp}
                  />
                  <Field
                    name="customer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    error={formError.customer_org_ogrn}
                    value={formValue.customer_org_ogrn}
                  />
                  <Field
                    name="customer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    error={formError.customer_org_legal_address}
                    value={formValue.customer_org_legal_address}
                  />
                  <Field
                    name="customer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    error={formError.customer_org_fact_address}
                    value={formValue.customer_org_fact_address}
                  />
                  <hr />
                </div>
              </Animation.Collapse>
              <Field
                name="customer_representative_id"
                label="Контактное лицо"
                accepter={SelectPicker}
                preventOverflow
                error={formError.procedure_section}
                data={
                  customerEmployeesQuery.isError ||
                    !customerEmployeesQuery?.data?.length
                    ? [{ label: "Заполнить вручную", value: "MANUAL_INPUT" }]
                    : [
                      ...customerEmployeesQuery?.data?.map((emp) => ({
                        label: emp.user_name || "Сотрудник",
                        value: emp.id,
                      })),
                      { label: "Заполнить вручную", value: "MANUAL_INPUT" },
                    ]
                }
                loading={customerEmployeesQuery.isLoading}
                placeholder="Выберите"
              />
              <Animation.Collapse
                in={isSubCustomerManualInput || isErrorsExists}
              >
                <div>
                  <Field
                    name="customer_representative_surname"
                    label="Фамилия"
                    accepter={Input}
                    error={formError.customer_representative_surname}
                    value={formValue.customer_representative_surname}
                  />
                  <Field
                    name="customer_representative_name"
                    label="Имя"
                    accepter={Input}
                    error={formError.customer_representative_name}
                    value={formValue.customer_representative_name}
                  />
                  <Field
                    name="customer_representative_lastname"
                    label="Отчество"
                    accepter={Input}
                    error={formError.customer_representative_lastname}
                    value={formValue.customer_representative_lastname}
                  />
                  <Field
                    name="customer_representative_email"
                    label="Email"
                    accepter={Input}
                    error={formError.customer_representative_email}
                    value={formValue.customer_representative_email}
                  />
                  <Field
                    name="customer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    error={formError.customer_representative_phone}
                    value={formValue.customer_representative_phone}
                  />
                  <Field
                    name="customer_representative_phone_extra"
                    label="Добавочный номер телефона"
                    accepter={Input}
                    error={formError.customer_representative_phone_extra}
                    value={formValue.customer_representative_phone_extra}
                  />
                </div>
              </Animation.Collapse>
            </Panel>
          </Panel>
        </div>

        {/* <Panel header="Приглашение участников">
          <Field
            name="provision_contract_option"
            accepter={CheckboxGroup}
            error={formError.provision_contract_option}
          >
            <Checkbox value={"ON"}>Установлено</Checkbox>
          </Field>
        </Panel> */}

        <Form.Group>
          <Button onClick={prevStep}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Создать извещение
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step5;
