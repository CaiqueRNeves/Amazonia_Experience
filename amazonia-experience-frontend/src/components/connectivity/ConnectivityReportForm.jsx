import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  WifiIcon, 
  SignalIcon, 
  CheckIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

import Button from '../common/Button';
import TextareaField from '../common/TextareaField';
import RadioField from '../common/RadioField';
import RangeField from '../common/RangeField';

const ConnectivityReportForm = ({ spotId, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  
  // Criar esquema de validação com Yup
  const validationSchema = Yup.object({
    wifi_speed: Yup.string()
      .oneOf(['slow', 'medium', 'fast'], t('validation.invalidOption'))
      .required(t('validation.required')),
    wifi_reliability: Yup.number()
      .min(1, t('validation.min', { min: 1 }))
      .max(10, t('validation.max', { max: 10 }))
      .required(t('validation.required')),
    is_working: Yup.boolean()
      .required(t('validation.required')),
    comment: Yup.string()
      .max(200, t('validation.maxLength', { max: 200 }))
  });
  
  // Configurar Formik
  const formik = useFormik({
    initialValues: {
      wifi_speed: '',
      wifi_reliability: 5,
      is_working: true,
      comment: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        console.error('Error submitting report:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });
  
  return (
    <form onSubmit={formik.handleSubmit} className="connectivity-report-form">
      <div className="form-section">
        <h4>{t('connectivity.wifiSpeed')}</h4>
        <div className="radio-group">
          <RadioField
            id="wifi-speed-slow"
            name="wifi_speed"
            value="slow"
            label={t('connectivity.speeds.slow')}
            checked={formik.values.wifi_speed === 'slow'}
            onChange={formik.handleChange}
            error={formik.touched.wifi_speed && formik.errors.wifi_speed}
            icon={<WifiIcon className="icon" />}
          />
          
          <RadioField
            id="wifi-speed-medium"
            name="wifi_speed"
            value="medium"
            label={t('connectivity.speeds.medium')}
            checked={formik.values.wifi_speed === 'medium'}
            onChange={formik.handleChange}
            error={formik.touched.wifi_speed && formik.errors.wifi_speed}
            icon={<WifiIcon className="icon" />}
          />
          
          <RadioField
            id="wifi-speed-fast"
            name="wifi_speed"
            value="fast"
            label={t('connectivity.speeds.fast')}
            checked={formik.values.wifi_speed === 'fast'}
            onChange={formik.handleChange}
            error={formik.touched.wifi_speed && formik.errors.wifi_speed}
            icon={<WifiIcon className="icon" />}
          />
        </div>
        {formik.touched.wifi_speed && formik.errors.wifi_speed && (
          <div className="error-message">{formik.errors.wifi_speed}</div>
        )}
      </div>
      
      <div className="form-section">
        <h4>{t('connectivity.signalStrength')}</h4>
        <RangeField
          id="wifi-reliability"
          name="wifi_reliability"
          min={1}
          max={10}
          step={1}
          value={formik.values.wifi_reliability}
          onChange={formik.handleChange}
          error={formik.touched.wifi_reliability && formik.errors.wifi_reliability}
          labels={{
            min: t('connectivity.weak'),
            max: t('connectivity.strong')
          }}
          icon={<SignalIcon className="icon" />}
        />
        {formik.touched.wifi_reliability && formik.errors.wifi_reliability && (
          <div className="error-message">{formik.errors.wifi_reliability}</div>
        )}
      </div>
      
      <div className="form-section">
        <h4>{t('connectivity.isWorking')}</h4>
        <div className="toggle-group">
          <RadioField
            id="is-working-yes"
            name="is_working"
            value={true}
            label={t('common.yes')}
            checked={formik.values.is_working === true}
            onChange={() => formik.setFieldValue('is_working', true)}
            error={formik.touched.is_working && formik.errors.is_working}
            icon={<CheckIcon className="icon" />}
          />
          
          <RadioField
            id="is-working-no"
            name="is_working"
            value={false}
            label={t('common.no')}
            checked={formik.values.is_working === false}
            onChange={() => formik.setFieldValue('is_working', false)}
            error={formik.touched.is_working && formik.errors.is_working}
            icon={<XMarkIcon className="icon" />}
          />
        </div>
        {formik.touched.is_working && formik.errors.is_working && (
          <div className="error-message">{formik.errors.is_working}</div>
        )}
      </div>
      
      <div className="form-section">
        <h4>{t('connectivity.comment')}</h4>
        <TextareaField
          id="comment"
          name="comment"
          placeholder={t('connectivity.commentPlaceholder')}
          value={formik.values.comment}
          onChange={formik.handleChange}
          error={formik.touched.comment && formik.errors.comment}
          maxLength={200}
          rows={3}
        />
        {formik.touched.comment && formik.errors.comment && (
          <div className="error-message">{formik.errors.comment}</div>
        )}
        <div className="character-counter">
          {formik.values.comment.length}/200
        </div>
      </div>
      
      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          isLoading={submitting}
          disabled={submitting || !formik.isValid}
        >
          {t('connectivity.submitReport')}
        </Button>
      </div>
    </form>
  );
};

ConnectivityReportForm.propTypes = {
  spotId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ConnectivityReportForm;