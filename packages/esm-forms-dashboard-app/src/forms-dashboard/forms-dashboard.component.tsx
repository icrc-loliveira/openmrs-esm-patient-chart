import React, { useState } from 'react';
import { getConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './forms-dashboard.scss';
import { EmptyDataIllustration, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import FormsList from './form-list/forms-list.component';
import { useFormsToDisplay } from '../hooks/use-forms';
import { DataTableSkeleton, Layer, Tile } from '@carbon/react';
import { HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';

interface FormsDashboardProps {
  patientUuid: string;
  patient: fhir.Patient;
  isOffline: boolean;
}

const FormsDashboard: React.FC<FormsDashboardProps> = ({ patientUuid, patient, isOffline }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { isValidating, data, error } = useFormsToDisplay(patientUuid, isOffline);
  const [htmlFormEntryForms, setHtmlFormEntryForms] = React.useState<null | Array<HtmlFormEntryForm>>(null);
  const [searchTerm, setSearchTerm] = useState('');
  patient = { id: patientUuid }; //TODO workaround while isn't offline ready

  React.useEffect(() => {
    getConfig('@openmrs/esm-patient-forms-app').then((config) => {
      setHtmlFormEntryForms(config.htmlFormEntryForms as HtmlFormEntryForm[]);
    });
  }, []);

  if (data) {
    return (
      <div className={styles.widgetCard}>
        {data?.map((formsSection, i) => {
          let pageSize = undefined;
          return (
            <FormsList
              {...{ patientUuid, patient, visit: currentVisit, formsSection, searchTerm, pageSize, htmlFormEntryForms }}
              key={i}
            />
          );
        })}
      </div>
    );
  }

  if (isValidating) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <Layer>
      <Tile className={styles.tile}>
        <EmptyDataIllustration />
        <p className={styles.content}>{t('noFormsAvailable', 'There are no forms to display')}</p>
      </Tile>
    </Layer>
  );
};

export default FormsDashboard;
