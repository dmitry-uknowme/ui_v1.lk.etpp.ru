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
  сustomer_org_full_name: StringType().isRequired(
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

  console.log("procedureee 5", formGlobalValues);
  const procedureId = formGlobalServerData.procedureId;
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
    сustomer_org_full_name: "",
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

  const isErrorsExists = !!Object.keys(formError)?.length;

  const profileOrganizationsQuery = useQuery(
    [
      "profileOrganizations",
      formGlobalServerData?.session && formGlobalServerData.session.profileId,
    ],
    async () => {
      let organizations = await fetchProfileOrganizations({ profileId });
      const currentOrganization = await fetchProfile({ profileId });
      organizations = [...organizations, currentOrganization];
      if (organizations?.length) {
        setFormValue((state) => ({
          ...state,
          organizer_id: organizations[0].id,
          organizer_org_full_name: organizations[0].full_title_organization,
          organizer_org_short_name: organizations[0].short_title_organization,
          organizer_org_inn: organizations[0].inn,
          organizer_org_kpp: organizations[0].kpp,
          organizer_org_ogrn: organizations[0].ogrn,
          organizer_org_fact_address: organizations[0].fact_address,
          organizer_org_legal_address: organizations[0].legal_address,
          customer_id: organizations[0].id,
          сustomer_org_full_name: organizations[0].full_title_organization,
          customer_org_short_name: organizations[0].short_title_organization,
          customer_org_inn: organizations[0].inn,
          customer_org_kpp: organizations[0].kpp,
          customer_org_ogrn: organizations[0].ogrn,
          customer_org_fact_address: organizations[0].fact_address,
          customer_org_legal_address: organizations[0].legal_address,
        }));
      }
      return organizations;
    }
  );

  // console.log("profilleee", profileOrganizationsQuery.data);

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
    if (isOrganizerEqualsCustomer) {
      setFormValue((state) => ({
        ...state,
        customer_org_ogrn: state.organizer_org_ogrn,
        customer_representative_name: state.organizer_representative_name,
        customer_representative_lastname:
          state.organizer_representative_lastname,
        customer_representative_surname: state.organizer_representative_surname,
        customer_representative_email: state.organizer_representative_email,
        customer_representative_phone: state.organizer_representative_phone,
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
          ...(formGlobalValues?.lots?.length ? formGlobalValues.lots[0] : {}),
          positions: [],
        },
      ],

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
        full_title: formValue.сustomer_org_full_name,
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

    if (!formRef.current.check()) {
      toaster.push(
        <Message type="error">
          Пожалуйста, исправьте ошибки перед тем, как перейте на следующий шаг
        </Message>
      );
      document
        .querySelector(".rs-form-group .rs-form-error-message")
        ?.parentNode?.parentNode?.scrollIntoView();
      return;
    }

    setFormGlobalValues((state) => ({
      ...state,
      ...formGlobalValues,
      ...finalData,
    }));
    if (formGlobalServerData.actionType === ProcedureFormActionVariants.EDIT) {
      const procedureData = await updateProcedure(
        procedureId,
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
        console.log("update procedureeeeee", procedureData);
        setFormGlobalServerData((state) => ({
          ...state,
          procedure: procedureData,
        }));
        toaster.push(
          <Message type="success">Процедура успешно создана</Message>
        );
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
          toaster.push(
            <Message type="error">
              Ошибка при создании процедуры {JSON.stringify(err, null, 2)}
            </Message>
          );
        }
      );
      if (procedureData) {
        console.log("created procedureeeeee", procedureData.procedure);
        toaster.push(
          <Message type="success">Процедура успешно создана</Message>
        );
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

        // setFormGlobalValues((state) => ({
        //   ...state,
        //   id: procedureId,
        //   number: procedureNumber,
        //   notice_id: noticeId,
        // }));
        nextStep();
      }
    }
  };

  // useE

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
                  />
                  <Field
                    name="organizer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    error={formError.organizer_org_short_name}
                  />
                  <Field
                    name="organizer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    error={formError.organizer_org_inn}
                  />
                  <Field
                    name="organizer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    error={formError.organizer_org_kpp}
                  />
                  <Field
                    name="organizer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    error={formError.organizer_org_ogrn}
                  />
                  <Field
                    name="organizer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    error={formError.organizer_org_legal_address}
                  />
                  <Field
                    name="organizer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    error={formError.organizer_org_fact_address}
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
                  />
                  <Field
                    name="organizer_representative_name"
                    label="Имя"
                    accepter={Input}
                    error={formError.organizer_representative_name}
                  />
                  <Field
                    name="organizer_representative_surname"
                    label="Отчество"
                    accepter={Input}
                    error={formError.organizer_representative_surname}
                  />
                  <Field
                    name="organizer_representative_email"
                    label="Email"
                    accepter={Input}
                    error={formError.organizer_representative_email}
                  />
                  <Field
                    name="organizer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    error={formError.organizer_representative_phone}
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
                  />
                  <Field
                    name="customer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    error={formError.customer_org_short_name}
                  />
                  <Field
                    name="customer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    error={formError.customer_org_inn}
                  />
                  <Field
                    name="customer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    error={formError.customer_org_kpp}
                  />
                  <Field
                    name="customer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    error={formError.customer_org_ogrn}
                  />
                  <Field
                    name="customer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    error={formError.customer_org_legal_address}
                  />
                  <Field
                    name="customer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    error={formError.customer_org_fact_address}
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
                    error={formError.customer_representative_lastname}
                  />
                  <Field
                    name="customer_representative_name"
                    label="Имя"
                    accepter={Input}
                    error={formError.customer_representative_name}
                  />
                  <Field
                    name="customer_representative_lastname"
                    label="Отчество"
                    accepter={Input}
                    error={formError.customer_representative_surname}
                  />
                  <Field
                    name="customer_representative_email"
                    label="Email"
                    accepter={Input}
                    error={formError.customer_representative_email}
                  />
                  <Field
                    name="customer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    error={formError.customer_representative_phone}
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
            Далее
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Step5;
