import React from 'react';
import './StatsCard.css';

const StatsCard = ({ icon: Icon, label, value, trend, gradient }) => {
    return (
        <div className="stats-card glass-card scale-in" style={{ '--card-gradient': gradient }}>
            <div className="stats-icon-wrapper">
                <Icon className="stats-icon" />
            </div>
            <div className="stats-content">
                <span className="stats-label">{label}</span>
                <h3 className="stats-value">{value}</h3>
                {trend && (
                    <span className={`stats-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
