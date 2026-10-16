'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FieldErrors, FieldValues, FormState } from 'react-hook-form';
import { syncFormState } from '../store/reduxFormErrorBridgeSlice';

/**
 * Custom Hook: Syncs React Hook Form errors and validation state directly into Redux store
 */
export function useFormReduxSync<TFieldValues extends FieldValues>(
  formId: string,
  formState: FormState<TFieldValues>
) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fieldErrorsMap: Record<string, { type: string; message: string }> = {};

    const extractErrors = (errors: FieldErrors<TFieldValues>, prefix = '') => {
      Object.entries(errors).forEach(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (val && typeof val === 'object') {
          if ('message' in val && typeof val.message === 'string') {
            fieldErrorsMap[path] = {
              type: String(val.type || 'validation'),
              message: val.message
            };
          } else {
            extractErrors(val as FieldErrors<TFieldValues>, path);
          }
        }
      });
    };

    extractErrors(formState.errors);

    dispatch(
      syncFormState({
        formId,
        fieldErrors: fieldErrorsMap,
        isSubmitted: formState.isSubmitted,
        isValid: formState.isValid,
        lastUpdated: new Date().toISOString()
      })
    );
  }, [formId, formState.errors, formState.isSubmitted, formState.isValid, dispatch]);
}
