import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FormErrorPayload {
  formId: string; // e.g., 'product-add-form', 'bamboo-home-estimator', 'checkout-form', 'seo-manager-form'
  fieldErrors: Record<string, { type: string; message: string }>;
  isSubmitted: boolean;
  isValid: boolean;
  lastUpdated: string;
}

interface ReduxFormErrorState {
  forms: Record<string, FormErrorPayload>;
  errorLogs: { formId: string; fieldName: string; errorMessage: string; time: string }[];
}

const initialState: ReduxFormErrorState = {
  forms: {},
  errorLogs: []
};

export const reduxFormErrorBridgeSlice = createSlice({
  name: 'formErrors',
  initialState,
  reducers: {
    syncFormState: (state, action: PayloadAction<FormErrorPayload>) => {
      const { formId, fieldErrors, isSubmitted, isValid } = action.payload;
      state.forms[formId] = action.payload;

      // Log errors into stream if submitted with errors
      if (isSubmitted && !isValid) {
        Object.entries(fieldErrors).forEach(([fieldName, error]) => {
          if (error && error.message) {
            state.errorLogs.unshift({
              formId,
              fieldName,
              errorMessage: error.message,
              time: new Date().toLocaleTimeString()
            });
          }
        });
        // Limit log length
        if (state.errorLogs.length > 30) {
          state.errorLogs = state.errorLogs.slice(0, 30);
        }
      }
    },
    clearFormErrors: (state, action: PayloadAction<string>) => {
      delete state.forms[action.payload];
    },
    clearAllErrorLogs: (state) => {
      state.errorLogs = [];
    }
  }
});

export const { syncFormState, clearFormErrors, clearAllErrorLogs } = reduxFormErrorBridgeSlice.actions;

export default reduxFormErrorBridgeSlice.reducer;
