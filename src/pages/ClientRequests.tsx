import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientRequests = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to coming soon page
    navigate('/coming-soon');
  }, [navigate]);

  return null;
};

export default ClientRequests;
