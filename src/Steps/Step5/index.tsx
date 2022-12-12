import {
  Form,
  Button,
  CheckboxGroup,
  RadioGroup,
  Checkbox,
  Radio,
  Schema,
  CheckPicker,
  InputNumber,
  Panel,
  Slider,
  DatePicker,
  Message,
  toaster,
  FlexboxGrid,
  Input,
  Animation,
  SelectPicker,
  Header,
  Stack,
  InputGroup,
} from "rsuite";
import React, { useContext, useEffect, useState } from "react";
import PurchasePlanTable from "../../components/Table/PuchasePlanTable";
import { useQuery } from "react-query";
import fetchPurchasePlans from "../../services/api/fetchPurchasePlans";
import fetchPurchasePlan from "../../services/api/fetchPurchasePlan";
import fetchSession from "../../services/api/fetchSession";
import MultiStepFormContext from "../../context/multiStepForm/context";
import fetchProfileOrganizations from "../../services/api/fetchProfileOrganizations";
import axios from "axios";
import createProcedure from "../../services/api/createProcedure";
import fetchOrganizationEmployees from "../../services/api/fetchOrganizationEmployees";
import fetchOrganizationEmployee from "../../services/api/fetchOrganizationEmployee";

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
  is_via_plan: StringType().isRequired("Поле обязательно для заполнения"),
  procedure_title: StringType().isRequired("Поле обязательно для заполнения"),
});

const Step5 = ({ onNext, onPrevious }) => {
  const {
    formValues: formGlobalValues,
    setFormValues: setFormGlobalValues,
    serverData: formGlobalServerData,
    setServerData: setFormGlobalServerData,
  } = useContext(MultiStepFormContext);

  console.log("procedureee 5", formGlobalValues);

  const session = formGlobalServerData.session;
  const profileId = formGlobalServerData?.session?.profile_id;

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    isOrganizerEqualsCustomer: [],
    organizer_id: "",
    organizer_org_full_name: "",
    organizer_org_short_name: "",
    organizer_org_inn: "",
    organizer_org_kpp: "",
    organizer_org_ogrn: "",
    organizer_org_legal_address: "",
    organizer_org_fact_address: "",
    organizer_representative_id: "",
    organizer_representative_surname: "",
    organizer_representative_name: "",
    organizer_representative_lastname: "",
    organizer_representative_phone: "",
    organizer_representative_email: "",
    customer_id: "",
    customer_org_full_name: "",
    customer_org_short_name: "",
    customer_org_inn: "",
    customer_org_kpp: "",
    customer_org_ogrn: "",
    customer_org_legal_address: "",
    customer_org_fact_address: "",
    customer_representative_id: "",
    customer_representative_surname: "",
    customer_representative_name: "",
    customer_representative_lastname: "",
    customer_representative_phone: "",
    customer_representative_email: "",
  });

  const profileOrganizationsQuery = useQuery(
    [
      "profileOrganizations",
      formGlobalServerData?.session && formGlobalServerData.session.profileId,
    ],
    async () => {
      const organizations = await fetchProfileOrganizations({ profileId });
      setFormValue((state) => ({
        ...state,
        organizer_id: organizations.id,
        organizer_org_full_name: organizations.full_title_organization,
        organizer_org_short_name: organizations.short_title_organization,
        organizer_org_inn: organizations.inn,
        organizer_org_kpp: organizations.kpp,
        organizer_org_ogrn: organizations.ogrn,
        organizer_org_fact_address: organizations.fact_ADDRESS,
        organizer_org_legal_address: organizations.legal_address,
        customer_id: organizations.id,
        customer_org_full_name: organizations.full_title_organization,
        customer_org_short_name: organizations.short_title_organization,
        customer_org_inn: organizations.inn,
        customer_org_kpp: organizations.kpp,
        customer_org_ogrn: organizations.ogrn,
        customer_org_fact_address: organizations.fact_ADDRESS,
        customer_org_legal_address: organizations.legal_address,
      }));
      return organizations;
    }
  );

  const organizerEmployeesQuery = useQuery(
    ["organizerEmployees", formValue.organizer_id],
    async () => {
      const employees = await fetchOrganizationEmployees(
        formValue.organizer_id
      );
      if (employees?.length) {
        setFormValue((state) => ({
          ...state,
          organizer_representative_id: employees[0].id,
        }));
      }
      return employees;
    },
    {
      enabled:
        formValue.organizer_id.trim().length &&
        formValue.organizer_id !== "MANUAL_INPUT"
          ? true
          : false,
    }
  );

  const customerEmployeesQuery = useQuery(
    ["customerEmployees", formValue.customer_id],
    async () => {
      const employees = await fetchOrganizationEmployees(formValue.customer_id);
      if (employees?.length) {
        setFormValue((state) => ({
          ...state,
          customer_representative_id: employees[0].id,
        }));
      }
      return employees;
    },
    {
      enabled:
        formValue.customer_id.trim().length &&
        formValue.customer_id !== "MANUAL_INPUT"
          ? true
          : false,
    }
  );

  const currentOrganizerOrganization = profileOrganizationsQuery?.data ?? null;
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
        }));
      }
      return employee;
    },
    {
      enabled:
        formValue.organizer_representative_id?.trim()?.length &&
        formValue.organizer_representative_id !== "MANUAL_INPUT"
          ? true
          : false,
    }
  );

  const customerEmployeeQuery = useQuery(
    ["customerEmployee", formValue.customer_representative_id],
    async () => {
      const employee = await fetchOrganizationEmployee(
        formValue.organizer_representative_id
      );
      if (employee) {
        setFormValue((state) => ({
          ...state,
          customer_representative_name: employee.full_name_first_name,
          customer_representative_surname: employee.full_name_last_name,
          customer_representative_lastname: employee.full_name_middle_name,
          customer_representative_email: employee.email,
          customer_representative_phone: employee.phone,
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
    }
  );

  const currentOrganizerEmployee = organizerEmployeeQuery.data;
  const currentCustomerEmployee = customerEmployeeQuery.data;

  console.log("org", currentOrganizerEmployee);

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
    const finalData = {
      customer: {
        ogrn: formValue.customer_org_ogrn,
        first_name: formValue.customer_representative_name,
        last_name: formValue.customer_representative_lastname,
        middle_name: formValue.customer_representative_surname,
        email: formValue.customer_representative_email,
        phone: formValue.customer_representative_phone,
        additional_phone: "This is",
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
        additional_phone: "This is",
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
    setFormGlobalValues((state) => ({
      ...state,
      ...formGlobalValues,
      ...finalData,
    }));
    const procedureData = await createProcedure(
      { ...finalData, ...formGlobalValues },
      (err) => {
        toaster.push(
          <Message type="error">
            Ошибка при создании процедуры {JSON.stringify(err, null, 2)}
          </Message>
        );
      }
    );

    if (procedureData) {
      toaster.push(<Message type="success">Процедура успешно создана</Message>);
      const noticeId = procedureData.notice_id;
      setFormGlobalServerData((state) => ({
        ...state,
        noticeId,
        procedure: procedureData.procedure,
      }));
      onNext();
    }
  };

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
            header={`Сведения об организаторе ${
              isOrganizerEqualsCustomer ? "и заказчике" : ""
            }`}
          >
            <Panel>
              <Field
                name="organizer_id"
                label="Организация"
                accepter={SelectPicker}
                error={formError.procedure_section}
                data={
                  profileOrganizationsQuery.isError
                    ? [{ label: "Заполнить вручную", value: "MANUAL_INPUT" }]
                    : [
                        {
                          label:
                            profileOrganizationsQuery?.data
                              ?.short_title_organization,
                          value: profileOrganizationsQuery?.data?.id,
                        },
                        { label: "Заполнить вручную", value: "MANUAL_INPUT" },
                      ]
                }
                loading={profileOrganizationsQuery.isLoading}
                placeholder="Выберите"
              />
              <Animation.Collapse in={isOrganizerManualInput} timeout={500}>
                <div>
                  <Field
                    name="organizer_org_full_name"
                    label="Полное наименование организации"
                    accepter={Input}
                    value={
                      isOrganizerManualInput
                        ? formValue.organizer_org_full_name
                        : currentOrganizerOrganization?.full_title_organization
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    value={
                      isOrganizerManualInput
                        ? formValue.organizer_org_short_name
                        : currentOrganizerOrganization?.short_title_organization
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    value={
                      isOrganizerManualInput
                        ? formValue.organizer_org_inn
                        : currentOrganizerOrganization?.inn
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    value={
                      isOrganizerManualInput
                        ? formValue.organizer_org_kpp
                        : currentOrganizerOrganization?.kpp
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    value={
                      isOrganizerManualInput
                        ? formValue.organizer_org_ogrn
                        : currentOrganizerOrganization?.ogrn
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    value={
                      isOrganizerManualInput
                        ? formValue.organizer_org_ogrn
                        : currentOrganizerOrganization?.legal_address
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    value={
                      isOrganizerManualInput
                        ? formValue.organizer_org_ogrn
                        : currentOrganizerOrganization?.fact_ADDRESS
                    }
                    error={formError.procedure_title}
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
              <Animation.Collapse in={isSubOrganizerManualInput}>
                <div>
                  <Field
                    name="organizer_representative_surname"
                    label="Фамилия"
                    accepter={Input}
                    value={
                      isSubOrganizerManualInput
                        ? formValue.organizer_representative_lastname
                        : currentOrganizerEmployee?.full_name_last_name
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_name"
                    label="Имя"
                    accepter={Input}
                    value={
                      isSubOrganizerManualInput
                        ? formValue.organizer_representative_name
                        : currentOrganizerEmployee?.full_name_first_name
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_lastname"
                    label="Отчество"
                    accepter={Input}
                    value={
                      isSubOrganizerManualInput
                        ? formValue.organizer_representative_surname
                        : currentOrganizerEmployee?.full_name_middle_name
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_email"
                    label="Email"
                    accepter={Input}
                    value={
                      isSubOrganizerManualInput
                        ? formValue.organizer_representative_email
                        : currentOrganizerEmployee?.email
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    value={
                      isSubOrganizerManualInput
                        ? formValue.organizer_representative_phone
                        : currentOrganizerEmployee?.phone
                    }
                    error={formError.procedure_title}
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
                  profileOrganizationsQuery.isError
                    ? [{ label: "Заполнить вручную", value: "MANUAL_INPUT" }]
                    : [
                        {
                          label:
                            profileOrganizationsQuery?.data
                              ?.short_title_organization,
                          value: profileOrganizationsQuery?.data?.id,
                        },
                        { label: "Заполнить вручную", value: "MANUAL_INPUT" },
                      ]
                }
                loading={profileOrganizationsQuery.isLoading}
                placeholder="Выберите"
              />
              <Animation.Collapse in={isCustomerManualInput} timeout={500}>
                <div>
                  <Field
                    name="customer_org_full_name"
                    label="Полное наименование организации"
                    accepter={Input}
                    value={
                      isCustomerManualInput
                        ? formValue.customer_org_full_name
                        : currentOrganizerOrganization?.full_title_organization
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    value={
                      isCustomerManualInput
                        ? formValue.customer_org_short_name
                        : currentOrganizerOrganization?.short_title_organization
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    value={
                      isCustomerManualInput
                        ? formValue.customer_org_inn
                        : currentOrganizerOrganization?.inn
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    value={
                      isCustomerManualInput
                        ? formValue.customer_org_kpp
                        : currentOrganizerOrganization?.kpp
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    value={
                      isCustomerManualInput
                        ? formValue.customer_org_ogrn
                        : currentOrganizerOrganization?.ogrn
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    value={
                      isCustomerManualInput
                        ? formValue.customer_org_legal_address
                        : currentOrganizerOrganization?.legal_address
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    value={
                      isCustomerManualInput
                        ? formValue.customer_org_fact_address
                        : currentOrganizerOrganization?.fact_ADDRESS
                    }
                    error={formError.procedure_title}
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
              <Animation.Collapse in={isSubCustomerManualInput}>
                <div>
                  <Field
                    name="customer_representative_surname"
                    label="Фамилия"
                    accepter={Input}
                    value={
                      isSubCustomerManualInput
                        ? formValue.customer_representative_lastname
                        : currentCustomerEmployee?.full_name_last_name
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_representative_name"
                    label="Имя"
                    accepter={Input}
                    value={
                      isSubCustomerManualInput
                        ? formValue.customer_representative_name
                        : currentCustomerEmployee?.full_name_first_name
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_representative_lastname"
                    label="Отчество"
                    accepter={Input}
                    value={
                      isSubCustomerManualInput
                        ? formValue.customer_representative_surname
                        : currentCustomerEmployee?.full_name_middle_name
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_representative_email"
                    label="Email"
                    accepter={Input}
                    value={
                      isSubCustomerManualInput
                        ? formValue.customer_representative_email
                        : currentCustomerEmployee?.email
                    }
                    error={formError.procedure_title}
                  />
                  <Field
                    name="customer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    value={
                      isSubCustomerManualInput
                        ? formValue.customer_representative_phone
                        : currentCustomerEmployee?.phone
                    }
                    error={formError.procedure_title}
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
          <Button onClick={onPrevious}>Назад</Button>
          <Button appearance="primary" onClick={handleSubmit}>
            Далее
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step5;
