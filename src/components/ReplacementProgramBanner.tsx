import React from 'react';
import { Link } from 'react-router-dom';
import './ReplacementProgramBanner.css';

const ReplacementProgramBanner: React.FC = () => {
  return (
    <Link to="/replacement-program" className="replacement-program-banner">
      <div className="replacement-program-banner-inner">
        <div className="replacement-program-banner-content">
          <h2 className="replacement-program-banner-title">
            شیرآلات کهنه‌ات رو با نو تعویض کن!
          </h2>
          <p className="replacement-program-banner-subtitle">
            با طرح تعویض شیرآلات کهنه با نو، هزینه شیرآلات جدیدت رو کمتر کن.
          </p>
        </div>
        <span className="replacement-program-banner-cta">
          مشاهده شرایط طرح ←
        </span>
      </div>
    </Link>
  );
};

export default ReplacementProgramBanner;
