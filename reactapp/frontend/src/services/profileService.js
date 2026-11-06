import api from './api';

// =========================================================
// PROFILE
// =========================================================

/**
 * Get the currently logged-in user's profile.
 *
 * Backend:
 * GET /api/accounts/profile/
 */
export const getMyProfile = async () => {
  return api.apiRequest('/accounts/profile/', {
    method: 'GET',
  });
};

/**
 * Update basic user profile.
 *
 * Backend:
 * PATCH /api/accounts/profile/update/
 *
 * Supported:
 * username
 * email
 * phone
 */
export const updateProfile = async ({
  username,
  phone,
  email,
}) => {
  const data = {};

  if (username !== undefined && username !== null) {
    data.username = String(username).trim();
  }

  if (phone !== undefined && phone !== null) {
    data.phone = String(phone).trim();
  }

  if (email !== undefined && email !== null) {
    data.email = String(email).trim().toLowerCase();
  }

  return api.apiRequest('/accounts/profile/update/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// =========================================================
// DRIVER PROFILE
// =========================================================

/**
 * Update driver details and upload driver documents.
 *
 * Backend:
 * POST /api/accounts/driver-upgrade/
 *
 * Supported:
 * vehicle_number
 * dl_image
 * rc_image
 * profile_image
 */
export const updateDriverProfile = async ({
  vehicle_number,
  dl_image,
  rc_image,
  profile_image,
}) => {
  const formData = new FormData();

  // -----------------------------
  // Vehicle number
  // -----------------------------
  if (
    vehicle_number !== undefined &&
    vehicle_number !== null &&
    String(vehicle_number).trim()
  ) {
    formData.append(
      'vehicle_number',
      String(vehicle_number)
        .trim()
        .toUpperCase(),
    );
  }

  // -----------------------------
  // Helper for images
  // -----------------------------
  const appendImage = (
    fieldName,
    image,
    defaultFileName,
  ) => {
    if (!image) {
      return;
    }

    const uri =
      typeof image === 'string'
        ? image
        : image.uri;

    if (!uri) {
      return;
    }

    const type =
      typeof image === 'object' &&
      image.type
        ? image.type
        : 'image/jpeg';

    const name =
      typeof image === 'object' &&
      (image.fileName || image.name)
        ? image.fileName || image.name
        : defaultFileName;

    formData.append(fieldName, {
      uri,
      type,
      name,
    });
  };

  appendImage(
    'dl_image',
    dl_image,
    `driving_license_${Date.now()}.jpg`,
  );

  appendImage(
    'rc_image',
    rc_image,
    `vehicle_rc_${Date.now()}.jpg`,
  );

  appendImage(
    'profile_image',
    profile_image,
    `driver_profile_${Date.now()}.jpg`,
  );

  const response = await api.apiRequest(
    '/accounts/driver-upgrade/',
    {
      method: 'POST',
      body: formData,
    },
  );

  // Get the latest profile after upload/update.
  const profile = await getMyProfile();

  return {
    ...response,
    profile,
  };
};

/**
 * Upload only driver profile image.
 */
export const uploadDriverProfileImage = async image => {
  return updateDriverProfile({
    profile_image: image,
  });
};

/**
 * Get driver profile only.
 */
export const getDriverProfile = async () => {
  const profile = await getMyProfile();

  if (!profile) {
    return null;
  }

  if (profile.role !== 'DRIVER') {
    return null;
  }

  return profile;
};

// =========================================================
// BANK DETAILS
// =========================================================

/**
 * Save/update bank account.
 *
 * Backend:
 * POST /api/payments/bank-account/
 */
export const saveBankAccount = async ({
  account_holder_name,
  bank_name,
  account_number,
  ifsc_code,
  upi_id,
}) => {
  const data = {
    account_holder_name:
      String(account_holder_name || '').trim(),

    bank_name:
      String(bank_name || '').trim(),

    account_number:
      String(account_number || '').trim(),

    ifsc_code:
      String(ifsc_code || '')
        .trim()
        .toUpperCase(),
  };

  // UPI is optional
  if (
    upi_id !== undefined &&
    upi_id !== null &&
    String(upi_id).trim()
  ) {
    data.upi_id = String(upi_id).trim();
  }

  return api.apiRequest(
    '/payments/bank-account/',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
};

// =========================================================
// WALLET
// =========================================================

/**
 * Create wallet top-up order.
 *
 * Backend:
 * POST /api/payments/wallet/topup/
 */
export const createWalletTopup = async amount => {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      'Enter a valid wallet top-up amount.',
    );
  }

  return api.apiRequest(
    '/payments/wallet/topup/',
    {
      method: 'POST',
      body: JSON.stringify({
        amount: numericAmount,
      }),
    },
  );
};

/**
 * Verify wallet top-up payment.
 *
 * Backend:
 * POST /api/payments/wallet/verify/
 */
export const verifyWalletTopup = async paymentData => {
  if (!paymentData) {
    throw new Error(
      'Payment verification data is required.',
    );
  }

  return api.apiRequest(
    '/payments/wallet/verify/',
    {
      method: 'POST',
      body: JSON.stringify(paymentData),
    },
  );
};

/**
 * Withdraw money from wallet.
 *
 * Backend:
 * POST /api/payments/wallet/withdraw/
 */
export const withdrawWallet = async amount => {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      'Enter a valid withdrawal amount.',
    );
  }

  return api.apiRequest(
    '/payments/wallet/withdraw/',
    {
      method: 'POST',
      body: JSON.stringify({
        amount: numericAmount,
      }),
    },
  );
};

/**
 * Get user's withdrawal history.
 *
 * Backend:
 * GET /api/payments/wallet/my-withdrawals/
 */
export const getMyWithdrawals = async () => {
  return api.apiRequest(
    '/payments/wallet/my-withdrawals/',
    {
      method: 'GET',
    },
  );
};

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default {
  // Profile
  getMyProfile,
  updateProfile,

  // Driver
  updateDriverProfile,
  uploadDriverProfileImage,
  getDriverProfile,

  // Bank
  saveBankAccount,

  // Wallet
  createWalletTopup,
  verifyWalletTopup,
  withdrawWallet,
  getMyWithdrawals,
};