import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearAllErrorLogs } from '../../store/reduxFormErrorBridgeSlice';
import { Code2, ShieldAlert, CheckCircle2, Trash2, Layers, Cpu } from 'lucide-react';

export const ReduxFormConsole: React.FC = () => {
  const dispatch = useDispatch();
  const formStateMap = useSelector((state: RootState) => state.formErrors.forms);
  const errorLogs = useSelector((state: RootState) => state.formErrors.errorLogs);

  const cartState = useSelector((state: RootState) => state.cart);
  const filterState = useSelector((state: RootState) => state.filter);
  const seoState = useSelector((state: RootState) => state.seo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-50">Redux Store & React Hook Form Error Bridge</h1>
          <p className="text-stone-400 text-xs mt-0.5">
            Real-time inspection showing how React Hook Form validation errors sync directly into Redux state.
          </p>
        </div>

        <button
          onClick={() => dispatch(clearAllErrorLogs())}
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Clear Error Stream</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Active Form Validation Errors in Redux */}
        <div className="lg:col-span-6 bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Active Form Error Bridges in Redux</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            {Object.keys(formStateMap).length === 0 ? (
              <p className="text-stone-500 py-4 text-center">
                No active forms submitted with errors yet. Try submitting the Bamboo Home Estimator or Product form with empty fields!
              </p>
            ) : (
              Object.entries(formStateMap).map(([formId, data]) => (
                <div key={formId} className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>Form ID: {formId}</span>
                    <span className="text-[10px] bg-stone-900 px-2 py-0.5 rounded text-stone-400">
                      IsValid: {String(data.isValid)}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {Object.keys(data.fieldErrors).length === 0 ? (
                      <span className="text-emerald-400 text-[11px]">✓ Zero field validation errors</span>
                    ) : (
                      Object.entries(data.fieldErrors).map(([field, err]) => (
                        <div key={field} className="bg-rose-950/40 p-2 rounded border border-rose-900 text-rose-300 text-[11px] flex justify-between">
                          <span>Field: <strong>{field}</strong></span>
                          <span>Err: {err.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Error Log Stream */}
          <div className="pt-4 border-t border-stone-800 space-y-2">
            <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Error Action Event Stream ({errorLogs.length})
            </h4>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {errorLogs.length === 0 ? (
                <span className="text-stone-600">Error stream idle...</span>
              ) : (
                errorLogs.map((log, i) => (
                  <div key={i} className="text-rose-400 flex justify-between border-b border-stone-900 pb-1">
                    <span>[{log.time}] {log.formId} › {log.fieldName}: {log.errorMessage}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Full Redux Store State Tree Preview */}
        <div className="lg:col-span-6 bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Redux State Slices Tree</span>
          </h3>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-[11px] font-mono text-stone-300 space-y-3 max-h-[500px] overflow-y-auto">
            <div>
              <span className="text-amber-400 font-bold block mb-1">▶ state.cart</span>
              <pre className="text-stone-400 bg-stone-900 p-2 rounded border border-stone-800 overflow-x-auto">
                {JSON.stringify({ itemsCount: cartState.items.length, couponCode: cartState.couponCode, currency: cartState.currency }, null, 2)}
              </pre>
            </div>

            <div>
              <span className="text-emerald-400 font-bold block mb-1">▶ state.filter</span>
              <pre className="text-stone-400 bg-stone-900 p-2 rounded border border-stone-800 overflow-x-auto">
                {JSON.stringify(filterState, null, 2)}
              </pre>
            </div>

            <div>
              <span className="text-blue-400 font-bold block mb-1">▶ state.seo</span>
              <pre className="text-stone-400 bg-stone-900 p-2 rounded border border-stone-800 overflow-x-auto">
                {JSON.stringify({ siteTitle: seoState.siteTitle, canonicalUrl: seoState.canonicalUrl }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
