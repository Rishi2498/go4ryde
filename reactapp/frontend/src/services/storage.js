import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';
const USER_ROLE = 'user_role';
const USER_DATA = 'user_data';

export const saveAuth = async ({
  access,
  refresh,
  role,
  user,
}) => {
  if (access !== undefined) {
    await AsyncStorage.setItem(ACCESS_TOKEN, access || '');
  }

  if (refresh !== undefined) {
    await AsyncStorage.setItem(REFRESH_TOKEN, refresh || '');
  }

  if (role !== undefined) {
    await AsyncStorage.setItem(
      USER_ROLE,
      role || 'PASSENGER',
    );
  }

  if (user) {
    await AsyncStorage.setItem(
      USER_DATA,
      JSON.stringify(user),
    );
  }
};

export const saveUser = async user => {
  if (!user) {
    return;
  }

  await AsyncStorage.setItem(
    USER_DATA,
    JSON.stringify(user),
  );

  if (user.role) {
    await AsyncStorage.setItem(
      USER_ROLE,
      user.role,
    );
  }
};

export const updateUser = async newData => {
  if (!newData) {
    return null;
  }

  const existingUser = await getUser();

  const updatedUser = {
    ...(existingUser || {}),
    ...newData,
  };

  await saveUser(updatedUser);
  return updatedUser;
};

export const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem(USER_DATA);

    if (!userString) {
      return null;
    }

    return JSON.parse(userString);
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

export const getUserRole = async () => {
  try {
    const role = await AsyncStorage.getItem(USER_ROLE);
    return role || 'PASSENGER';
  } catch {
    return 'PASSENGER';
  }
};

export const getAuth = async () => {
  const access = await AsyncStorage.getItem(ACCESS_TOKEN);
  const refresh = await AsyncStorage.getItem(REFRESH_TOKEN);
  const role = await getUserRole();
  const user = await getUser();

  return {
    access: access || null,
    refresh: refresh || null,
    role,
    user,
  };
};

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN);
  } catch {
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN);
  } catch {
    return null;
  }
};

export const clearUser = async () => {
  await AsyncStorage.removeItem(USER_DATA);
};

export const clearAuth = async () => {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    USER_ROLE,
    USER_DATA,
  ]);
};

export default {
  saveAuth,
  saveUser,
  updateUser,
  getUser,
  getUserRole,
  getAuth,
  getAccessToken,
  getRefreshToken,
  clearUser,
  clearAuth,
};
