'use client';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useStorageConfigQuery, useUploadFileMutation } from '../../services/api';
import { setNotification, NotificationType } from '../../store/adminSlice';
import { HardDrive, Upload, Link } from 'lucide-react';

export const StorageManager: React.FC = () => {
  const dispatch = useDispatch();
  const { data: storageConfig, isLoading } = useStorageConfigQuery();
  const uploadMutation = useUploadFileMutation();

  const [testFileResult, setTestFileResult] = useState<{ url: string; filename: string } | null>(null);

  const stats = storageConfig?.uploadStats;

  const handleTestUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(
        { file, folder: 'admin_test' },
        {
          onSuccess: (data) => {
            setTestFileResult(data);
            dispatch(
              setNotification({
                message: 'File uploaded successfully!',
                type: NotificationType.Success
              })
            );
          },
          onError: (err: any) => {
            dispatch(setNotification({ message: err.message || 'Upload failed', type: NotificationType.Error }));
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-50">File Uploads</h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            Product media and file uploads. The storage backend is configured server-side via environment variables.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-mono text-primary-400 font-bold flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary-400" />
          <span>Files Stored: {isLoading ? '...' : (stats?.totalFiles ?? 0)}</span>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Files</p>
          <p className="text-2xl font-black text-neutral-50 font-mono">{stats?.totalFiles ?? 0}</p>
          <p className="text-[11px] text-neutral-500">All uploads through the store pipeline</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Storage Used</p>
          <p className="text-2xl font-black text-accent-400 font-mono">
            {((stats?.totalSizeBytes || 0) / 1048576).toFixed(2)} MB
          </p>
          <p className="text-[11px] text-neutral-500">Aggregated upload payload size</p>
        </div>
      </div>

      {/* Live Upload Test Panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary-400" />
          <span>Upload Test Panel</span>
        </h3>

        <div className="flex flex-wrap gap-4 items-center">
          <label className="px-5 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer flex items-center gap-2 shadow">
            <Upload className="w-4 h-4" />
            <span>Select File to Test Upload</span>
            <input type="file" onChange={handleTestUpload} className="hidden" />
          </label>

          {uploadMutation.isPending && (
            <span className="text-xs text-accent-400 font-mono animate-pulse">
              Uploading file...
            </span>
          )}
        </div>

        {testFileResult && (
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-primary-400">
              <span className="font-bold">✓ Upload Success</span>
              <span className="text-neutral-500 text-[10px]">{testFileResult.filename}</span>
            </div>
            <div className="bg-neutral-900 p-2 rounded text-neutral-300 break-all text-[11px] border border-neutral-800 flex items-center gap-2">
              <Link className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>{testFileResult.url}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
