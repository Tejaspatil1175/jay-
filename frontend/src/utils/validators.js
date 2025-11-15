// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation
export const validatePassword = (password) => {
  // At least 8 characters
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  return null;
};

// Stock symbol validation
export const validateSymbol = (symbol) => {
  // 1-5 uppercase letters
  const re = /^[A-Z]{1,5}$/;
  if (!re.test(symbol)) {
    return 'Symbol must be 1-5 uppercase letters';
  }
  return null;
};

// Validate positive number
export const validatePositiveNumber = (value, fieldName = 'Value') => {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

// Validate integer
export const validateInteger = (value, fieldName = 'Value') => {
  const num = parseInt(value);
  if (isNaN(num) || num <= 0 || num !== parseFloat(value)) {
    return `${fieldName} must be a positive integer`;
  }
  return null;
};

// Validate file
export const validateFile = (file, maxSize = 25 * 1024 * 1024) => {
  if (!file) {
    return 'Please select a file';
  }
  
  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }
  
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'image/jpeg',
    'image/png',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Allowed: PDF, Excel, CSV, JPG, PNG';
  }
  
  return null;
};
