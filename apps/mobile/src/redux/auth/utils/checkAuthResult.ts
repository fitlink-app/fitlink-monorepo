export const checkAuthResult = (authResult: unknown) => {
  return (
    typeof authResult === 'object' &&
    authResult != null &&
    'id_token' in authResult &&
    'access_token' in authResult &&
    'refresh_token' in authResult
  );
};
