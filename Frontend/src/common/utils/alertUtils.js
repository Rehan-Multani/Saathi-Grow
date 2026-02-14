import Swal from 'sweetalert2';

export const showDeleteConfirmation = (title = 'Are you sure?', text = "You won't be able to revert this!") => {
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
        customClass: {
            popup: 'rounded-[12px]',
            icon: 'small-swal-icon'
        },
        didOpen: () => {
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
        }
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
