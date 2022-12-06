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

  const session = formGlobalServerData.session;
  const profileId = formGlobalServerData?.session?.profile_id;

  const profileOrganizationsQuery = useQuery(
    [
      "purchasePlan",
      formGlobalServerData?.session && formGlobalServerData.session.profileId,
    ],
    async () => {
      const organizations = await fetchProfileOrganizations({ profileId });
      setFormValue((state) => ({
        ...state,
        organizer_id: organizations.id,
        customer_id: organizations.id,
      }));
      return organizations;
    }
  );

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    isOrganizerEqualsCustomer: [],
    organizer_id: "",
    customer_id: "",
  });

  const isOrganizerManualInput = formValue.organizer_id === "MANUAL_INPUT";
  const isCustomerManualInput = formValue.customer_id === "MANUAL_INPUT";
  const isOrganizerEqualsCustomer =
    formValue.isOrganizerEqualsCustomer.includes("EQUAL");

  const handleSubmit = () => {
    onNext();
    // if (!formRef.current.check()) {
    //   toaster.push(<Message type="error">Error</Message>);
    //   return;
    // }
    // toaster.push(<Message type="success">Success</Message>);
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
                label="Выбрать из списка"
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
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <hr />
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "1.3rem" }}>
                    Контактное лицо
                  </h4>
                  <Field
                    name="organizer_representative_surname"
                    label="Фамилия"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_name"
                    label="Имя"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_lastname"
                    label="Отчество"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_email"
                    label="Email"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                </div>
              </Animation.Collapse>
            </Panel>
          </Panel>
          <Panel
            header="Сведения о заказчике"
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
                label="Выбрать из списка"
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
                placeholder="Выберите"
              />
              <Animation.Collapse in={isCustomerManualInput} timeout={500}>
                <div>
                  <Field
                    name="organizer_org_full_name"
                    label="Полное наименование организации"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_short_name"
                    label="Сокращенное наименование организации"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_inn"
                    label="ИНН"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_kpp"
                    label="КПП"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_ogrn"
                    label="ОГРН"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_legal_address"
                    label="Юридический адрес"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_org_fact_address"
                    label="Фактический адрес"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <hr />
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "1.3rem" }}>
                    Контактное лицо
                  </h4>
                  <Field
                    name="organizer_representative_surname"
                    label="Фамилия"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_name"
                    label="Имя"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_lastname"
                    label="Отчество"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_email"
                    label="Email"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                  <Field
                    name="organizer_representative_phone"
                    label="Номер телефона"
                    accepter={Input}
                    error={formError.procedure_title}
                  />
                </div>
              </Animation.Collapse>
            </Panel>
          </Panel>
        </div>

        <Panel header="Приглашение участников">
          <Field
            name="provision_contract_option"
            accepter={CheckboxGroup}
            error={formError.provision_contract_option}
          >
            <Checkbox value={"ON"}>Установлено</Checkbox>
          </Field>
        </Panel>

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
