import { useEffect, useState } from 'react';
import LoaderComponent from 'src/app/components/common/loader';
import LogoutRedux from 'src/utils/auth/logout';

const Logout = () => {
  const [loading, _setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('accessToken');
    LogoutRedux();
    window.location.assign(window.location.origin);
  }, []);

  return <>{loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}</>;
};

export default Logout;
