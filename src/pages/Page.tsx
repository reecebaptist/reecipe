import React from 'react';
import './styles.css';

interface PageProps {
  title: string;
  content: string;
}

const Page: React.FC<PageProps> = ({ title, content }) => {
  return (
    <div className="page-content">
      <h1>{title}</h1>
      <p>{content}</p>
    </div>
  );
};

export default Page;
