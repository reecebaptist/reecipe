import React from 'react';
import './styles.css';
import coverBg from '../assets/images/cover-bg-3.avif';

const Cover: React.FC = () => {
  return (
    <div className="page-content cover-page-layout">
      <div className="cover-header">
        <div className="title-line">
          <p className="author">Reece's</p>
          <h1>COOKBOOK</h1>
        </div>
      </div>
      <div className="cover-image-container">
        <img src={coverBg} alt="Cookbook cover" className="cover-image" />
      </div>
      <div className="cover-footer">
        <p className="year">2025</p>
      </div>
    </div>
  );
};

export default Cover;
