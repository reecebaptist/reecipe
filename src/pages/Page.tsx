import React from 'react';
import './styles.css';

interface PageProps {
  title: string;
  content: string;
  pageNumber?: number;
}

const Page: React.FC<PageProps> = ({ title, content, pageNumber }) => {
  return (
    <div className="page-content foreword-padding">
      <h1>{title}</h1>
      <p>{content}</p>
      {pageNumber && <div className="page-number">{pageNumber}</div>}
    </div>
  );
};

export default Page;
