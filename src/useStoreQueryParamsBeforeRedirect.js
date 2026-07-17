import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const useStoreQueryParamsBeforeRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const type = queryParams.get('type');

    if (!isAuthenticated()) { // Implement your authentication logic
      sessionStorage.setItem('redirectId', id);
      sessionStorage.setItem('redirectType', type);
      navigate('/login');
    }
  }, [location, navigate]);
};

const isAuthenticated = () => {
  // Replace this with your actual authentication logic
  return sessionStorage.getItem('authToken');
};

export default useStoreQueryParamsBeforeRedirect;

