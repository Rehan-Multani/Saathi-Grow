import Swal from 'sweetalert2';

export const showDeleteConfirmation = (title = 'Are you sure?', text = "You won't be able to revert this!") => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        width: '450px',
        padding: '1.5rem',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
        heightAuto: false,
        scrollbarPadding: false,
        customClass: {
            popup: 'rounded-[12px]',
            icon: 'small-swal-icon'
        },
        didOpen: () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            const icon = document.querySelector('.swal2-icon');
            if (icon) {
                icon.style.transform = 'scale(0.85)';
                icon.style.marginTop = '1rem';
                icon.style.marginBottom = '0.5rem';
            }
            const popup = document.querySelector('.swal2-popup');
            if (popup) {
                popup.style.borderRadius = '12px';
            }
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
