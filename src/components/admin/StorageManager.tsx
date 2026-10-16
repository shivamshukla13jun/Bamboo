'use client';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  useStorageConfigQuery,
  useUpdateStorageProviderMutation,
  useUploadFileMutation
} from '../../services/api';
import { StorageProviderType } from '../../types';
import { setNotification } from '../../store/adminSlice';
import { HardDrive, Cloud, Check, Upload, Link, AlertCircle, RefreshCw, FileCode } from 'lucide-react';

export const StorageManager: React.FC = () => {
  const dispatch = useDispatch();
  const { data: storageConfig, isLoading } = useStorageConfigQuery();
  const updateProviderMutation = useUpdateStorageProviderMutation();
  const uploadMutation = useUploadFileMutation();

  const [testFileResult, setTestFileResult] = useState<{ url: string; provider: string; filename: string } | null>(null);

  const providers: { key: StorageProviderType; name: string; desc: string; icon: string; envVar: string }[] = [
    {
      key: 'mock',
      name: 'Local / Data URL Storage',
      desc: 'Default zero-config local storage provider generating instant data URLs.',
      icon: '💾',
      envVar: 'STORAGE_PROVIDER="mock"'
    },
    {
      key: 'aws',
      name: 'AWS S3 Object Storage',
      desc: 'Amazon Web Services S3 bucket integration using AWS SDK credentials.',
      icon: '☁️',
      envVar: 'STORAGE_PROVIDER="aws"'
    },
    {
      key: 'cloudinary',
      name: 'Cloudinary CDN',
      desc: 'High-speed image optimization & transformations via Cloudinary Cloud API.',
      icon: '🖼️',
      envVar: 'STORAGE_PROVIDER="cloudinary"'
    },
    {
      key: 'minio',
      name: 'MinIO S3-Compatible Storage',
      desc: 'Self-hosted high performance MinIO object storage endpoint.',
      icon: '🗄️',
      envVar: 'STORAGE_PROVIDER="minio"'
    }
  ];

  const handleProviderSwitch = (provider: StorageProviderType) => {
    updateProviderMutation.mutate(provider, {
      onSuccess: (updated) => {
        dispatch(
          setNotification({
            message: `Switched active storage engine to ${provider.toUpperCase()}!`,
            type: 'success'
          })
        );
      }
    });
  };

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
                message: `Uploaded file to ${data.provider.toUpperCase()} successfully!`,
                type: 'success'
              })
            );
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-50">File Storage Provider Switcher</h1>
          <p className="text-stone-400 text-xs mt-0.5">
            Switch storage backends dynamically via UI or set <code className="text-emerald-400 bg-stone-900 px-1.5 py-0.5 rounded font-mono">STORAGE_PROVIDER</code> in `.env`.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400 font-bold flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Active Provider: {storageConfig?.activeProvider.toUpperCase() || 'MOCK'}</span>
        </div>
      </div>

      {/* Provider Selector Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {providers.map((p) => {
          const isActive = storageConfig?.activeProvider === p.key;
          return (
            <div
              key={p.key}
              onClick={() => handleProviderSwitch(p.key)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-stone-900 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h3 className="font-bold text-stone-100 text-sm">{p.name}</h3>
                    <code className="text-[10px] text-stone-400 font-mono block mt-0.5">{p.envVar}</code>
                  </div>
                </div>

                {isActive && (
                  <span className="bg-emerald-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">{p.desc}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProviderSwitch(p.key);
                }}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                }`}
              >
                {isActive ? 'Current Active Provider' : `Switch to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Live Upload Test Panel */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Upload Test Panel ({storageConfig?.activeProvider.toUpperCase()} Storage Engine)</span>
        </h3>

        <div className="flex flex-wrap gap-4 items-center">
          <label className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer flex items-center gap-2 shadow">
            <Upload className="w-4 h-4" />
            <span>Select File to Test Upload</span>
            <input type="file" onChange={handleTestUpload} className="hidden" />
          </label>

          {uploadMutation.isPending && (
            <span className="text-xs text-amber-400 font-mono animate-pulse">
              Uploading file through active {storageConfig?.activeProvider} pipeline...
            </span>
          )}
        </div>

        {testFileResult && (
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-bold">✓ Upload Success via {testFileResult.provider.toUpperCase()}</span>
              <span className="text-stone-500 text-[10px]">{testFileResult.filename}</span>
            </div>
            <div className="bg-stone-900 p-2 rounded text-stone-300 break-all text-[11px] border border-stone-800 flex items-center gap-2">
              <Link className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>{testFileResult.url}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
