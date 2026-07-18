import Swal from 'sweetalert2';

const CONFIRM_DELETE_WORD = 'DELETE';

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const DELETE_MODAL_STYLES = `
.swal2-container.saathi-delete-container {
  z-index: 100000 !important;
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.swal2-popup.saathi-delete-popup {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 1.5rem !important;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25) !important;
  padding: 0 !important;
  width: 28rem !important;
  max-width: calc(100vw - 2rem) !important;
  overflow: hidden !important;
  position: relative !important;
}
.swal2-popup.saathi-delete-popup .swal2-header {
  padding: 1.5rem 1.5rem 0 !important;
  background: #ffffff !important;
}
.swal2-popup.saathi-delete-popup .swal2-icon {
  margin: 0.75rem auto 0.5rem !important;
  transform: scale(0.85);
  border-color: #fdba74 !important;
  color: #ea580c !important;
}
.swal2-popup.saathi-delete-popup .swal2-icon.swal2-warning {
  border-color: #fdba74 !important;
  color: #ea580c !important;
}
.swal2-popup.saathi-delete-popup .swal2-title {
  color: #0f172a !important;
  font-size: 1.125rem !important;
  font-weight: 800 !important;
  padding: 0 1.5rem !important;
  margin: 0.25rem 0 0 !important;
}
.swal2-popup.saathi-delete-popup .swal2-html-container {
  color: #475569 !important;
  font-size: 0.875rem !important;
  margin: 0 !important;
  padding: 0.75rem 1.5rem 0 !important;
  background: #ffffff !important;
  overflow: visible !important;
}
.swal2-popup.saathi-delete-popup .swal2-input {
  width: calc(100% - 3rem) !important;
  margin: 0.75rem 1.5rem 0 !important;
  box-sizing: border-box !important;
  background: #f8fafc !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 1rem !important;
  color: #0f172a !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  text-align: center !important;
  font-size: 0.875rem !important;
  padding: 0.85rem 1rem !important;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04) !important;
}
.swal2-popup.saathi-delete-popup .swal2-input:focus {
  border-color: #f43f5e !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.12) !important;
}
.swal2-popup.saathi-delete-popup .swal2-validation-message {
  background: #fff1f2 !important;
  color: #be123c !important;
  margin: 0.75rem 1.5rem 0 !important;
  border-radius: 0.75rem !important;
}
.swal2-popup.saathi-delete-popup .swal2-actions {
  margin: 0 !important;
  padding: 1.25rem 1.5rem 1.5rem !important;
  gap: 0.75rem !important;
  width: 100% !important;
  background: #ffffff !important;
}
.swal2-popup.saathi-delete-popup .swal2-confirm,
.swal2-popup.saathi-delete-popup .swal2-cancel {
  flex: 1 !important;
  margin: 0 !important;
  border-radius: 1rem !important;
  padding: 0.85rem 1rem !important;
  font-size: 0.625rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
  box-shadow: none !important;
}
.swal2-popup.saathi-delete-popup .swal2-cancel {
  background: #f1f5f9 !important;
  color: #64748b !important;
  border: none !important;
}
.swal2-popup.saathi-delete-popup .swal2-confirm {
  background: #f43f5e !important;
  color: #ffffff !important;
  border: none !important;
}
.swal2-popup.saathi-delete-popup .swal2-confirm:disabled {
  background: #fecdd3 !important;
  color: #ffffff !important;
  opacity: 1 !important;
  cursor: not-allowed !important;
}
.swal2-popup.saathi-delete-popup .swal2-close {
  position: absolute !important;
  top: 0.85rem !important;
  right: 0.85rem !important;
  width: 2.25rem !important;
  height: 2.25rem !important;
  border-radius: 0.75rem !important;
  background: transparent !important;
  color: #94a3b8 !important;
  font-size: 1.75rem !important;
  line-height: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  z-index: 2 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background 0.15s ease, color 0.15s ease !important;
}
.swal2-popup.saathi-delete-popup .swal2-close:hover {
  background: #fff1f2 !important;
  color: #e11d48 !important;
}
.swal2-popup.saathi-delete-popup .swal2-close:focus {
  box-shadow: none !important;
}
`;

/**
 * Destructive delete confirmation — user must type DELETE to enable confirm.
 * Used across Admin, Vendor, Staff (and any shared callers).
 */
export const showDeleteConfirmation = (
    title = 'Are you sure?',
    text = "You won't be able to revert this!"
) => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const safeText = escapeHtml(text);

    // Inject styles once (refresh if content changed)
    let styleEl = document.getElementById('saathi-delete-swal-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'saathi-delete-swal-styles';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = DELETE_MODAL_STYLES;

    return Swal.fire({
        title,
        html: `
            <p style="color:#475569;font-size:14px;margin:0 0 12px;line-height:1.45;">${safeText}</p>
            <p style="color:#e11d48;font-size:11px;font-weight:800;margin:0;letter-spacing:0.06em;text-transform:uppercase;">
                Type <span style="font-family:ui-monospace,monospace;letter-spacing:0.08em;">DELETE</span> to confirm
            </p>
        `,
        icon: 'warning',
        input: 'text',
        inputPlaceholder: 'Type DELETE',
        inputAttributes: {
            autocapitalize: 'off',
            autocomplete: 'off',
            spellcheck: 'false',
            'aria-label': 'Type DELETE to confirm'
        },
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        focusCancel: true,
        allowOutsideClick: false,
        heightAuto: false,
        scrollbarPadding: false,
        buttonsStyling: true,
        customClass: {
            container: 'saathi-delete-container',
            popup: 'saathi-delete-popup',
            icon: 'saathi-delete-icon',
            input: 'saathi-delete-input',
            confirmButton: 'saathi-delete-confirm',
            cancelButton: 'saathi-delete-cancel',
            actions: 'saathi-delete-actions',
            closeButton: 'saathi-delete-close',
        },
        didOpen: () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            const confirmBtn = Swal.getConfirmButton();
            const input = Swal.getInput();
            if (confirmBtn) confirmBtn.disabled = true;
            if (input) {
                input.addEventListener('input', () => {
                    if (confirmBtn) {
                        confirmBtn.disabled = input.value.trim() !== CONFIRM_DELETE_WORD;
                    }
                });
            }
        },
        preConfirm: (value) => {
            if (String(value || '').trim() !== CONFIRM_DELETE_WORD) {
                Swal.showValidationMessage('Please type DELETE exactly to confirm');
                return false;
            }
            return true;
        },
        willClose: () => {
            document.body.style.overflow = prevBodyOverflow || '';
            document.documentElement.style.overflow = prevHtmlOverflow || '';
        }
    }).finally(() => {
        document.body.style.overflow = prevBodyOverflow || '';
        document.documentElement.style.overflow = prevHtmlOverflow || '';
    });
};

export const showSuccessAlert = (title = 'Deleted!', text = 'Your file has been deleted.') => {
    return Swal.fire(
        title,
        text,
        'success'
    );
};

export const showErrorAlert = (title = 'Error', text = 'Something went wrong.') => {
    return Swal.fire(
        title,
        text,
        'error'
    );
};
