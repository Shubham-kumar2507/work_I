import React from 'react';

const AlertBadge = ({ severity }) => {
    const getBadgeClass = () => {
        switch (severity) {
            case 'critical': return 'badge-offline';
            case 'high': return 'badge-warning';
            case 'medium': return 'badge-pending';
            case 'low': return 'badge-online';
            default: return 'badge-pending';
        }
    };

    return (
        <span className={`badge ${getBadgeClass()}`}>
            {severity || 'info'}
        </span>
    );
};

export default AlertBadge;
