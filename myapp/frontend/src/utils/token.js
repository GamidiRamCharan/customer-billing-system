export const setToken = (token) => {
  if (token) localStorage.setItem('jwt', token);
  else localStorage.removeItem('jwt');
};

export const getToken = () => localStorage.getItem('jwt') || null;
