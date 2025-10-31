import Swal from 'sweetalert2';

export const showSuccess = (message: string, title: string = 'Success!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#27BEEF',
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showError = (message: string, title: string = 'Error!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#27BEEF',
  });
};

export const showWarning = (message: string, title: string = 'Warning!') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#27BEEF',
  });
};

export const showInfo = (message: string, title: string = 'Info') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#27BEEF',
  });
};

export const showConfirm = async (
  message: string, 
  title: string = 'Are you sure?',
  confirmText: string = 'Yes',
  cancelText: string = 'No'
) => {
  const result = await Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#27BEEF',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
};

export const showLoading = (title: string = 'Please wait...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};
