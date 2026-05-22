import React, { useId, useRef } from 'react';
import { CheckCircle2, ImagePlus, Trash2, Upload } from 'lucide-react';

const MediaUploadField = ({
  label,
  previewUrl,
  helperText,
  recommendation,
  fileName,
  pending = false,
  height = 180,
  accept = 'image/*',
  disabled = false,
  onFileChange,
  onRemove
}) => {
  const inputId = useId();
  const inputRef = useRef(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
        {pending && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 size={14} />
            Ready for upload
          </span>
        )}
      </div>

      <div
        className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden relative flex flex-col items-center justify-center transition-colors hover:bg-slate-50"
        style={{ minHeight: height }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="w-full h-full object-cover"
            style={{ minHeight: height, maxHeight: height }}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center px-4 w-full h-full"
            style={{ minHeight: height }}
          >
            <div className="inline-flex items-center justify-center rounded-2xl bg-white shadow-sm mb-3 text-blue-500 border border-slate-100" style={{ width: 52, height: 52 }}>
              <ImagePlus size={22} />
            </div>
            <div className="text-sm font-bold text-slate-700">Choose image</div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 max-w-[200px]">This file will upload to Cloudinary when you save the page.</div>
          </div>
        )}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          onFileChange?.(file);
          event.target.value = '';
        }}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wide text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={16} />
          {previewUrl ? 'Change image' : 'Upload image'}
        </button>

        {previewUrl && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wide text-slate-600 hover:text-rose-600 hover:border-rose-500 hover:bg-rose-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            disabled={disabled}
            onClick={onRemove}
          >
            <Trash2 size={16} />
            Remove
          </button>
        )}
      </div>

      {(fileName || recommendation) && (
        <div className="mt-2">
          {fileName && <div className="text-xs font-semibold text-slate-700">{fileName}</div>}
          {recommendation && <div className="text-[11px] text-slate-400">{recommendation}</div>}
        </div>
      )}

      {helperText && <div className="text-[11px] text-slate-400 mt-1 ml-1">{helperText}</div>}
    </div>
  );
};

export default MediaUploadField;
