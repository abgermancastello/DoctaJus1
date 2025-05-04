import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="404"
        title="404"
        subTitle="Lo sentimos, la página que estás buscando no existe."
        extra={
          <Link to="/">
            <Button type="primary">Volver al Inicio</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;
