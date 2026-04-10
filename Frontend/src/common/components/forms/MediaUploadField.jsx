import React, { useId, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
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
    <Form.Group>
      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
        <Form.Label className="small fw-bold text-muted mb-0">{label}</Form.Label>
        {pending && (
          <span className="d-inline-flex align-items-center gap-1 small fw-semibold text-success">
            <CheckCircle2 size={14} />
            Ready for upload
          </span>
        )}
      </div>

      <div
        className="rounded-4 border border-2 border-dashed bg-light-subtle overflow-hidden position-relative"
        style={{ minHeight: height }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="w-100 h-100 object-fit-cover"
            style={{ minHeight: height, maxHeight: height }}
          />
        ) : (
          <div
            className="d-flex flex-column align-items-center justify-content-center text-center px-3"
            style={{ minHeight: height }}
          >
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm mb-3 text-primary" style={{ width: 52, height: 52 }}>
              <ImagePlus size={22} />
            </div>
            <div className="fw-bold text-dark">Choose image</div>
            <div className="small text-muted mt-1">This file will upload to Cloudinary when you save the page.</div>
          </div>
        )}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        className="d-none"
        accept={accept}
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          onFileChange?.(file);
          event.target.value = '';
        }}
      />

      <div className="d-flex flex-wrap gap-2 mt-3">
        <Button
          type="button"
          variant="outline-primary"
          className="d-inline-flex align-items-center gap-2"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={16} />
          {previewUrl ? 'Change image' : 'Upload image'}
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="light"
            className="d-inline-flex align-items-center gap-2 border text-danger"
            disabled={disabled}
            onClick={onRemove}
          >
            <Trash2 size={16} />
            Remove
          </Button>
        )}
      </div>

      {(fileName || recommendation) && (
        <div className="mt-2">
          {fileName && <div className="small fw-semibold text-dark">{fileName}</div>}
          {recommendation && <div className="small text-muted">{recommendation}</div>}
        </div>
      )}

      {helperText && <Form.Text className="text-muted">{helperText}</Form.Text>}
    </Form.Group>
  );
};

export default MediaUploadField;
