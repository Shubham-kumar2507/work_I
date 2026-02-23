import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './MetricChart.css';

const MetricChart = ({ data, dataKey, title, color, type = 'line' }) => {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{payload[0].payload.time}</p>
                    <p className="tooltip-value" style={{ color }}>
                        {dataKey}: {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const ChartComponent = type === 'area' ? AreaChart : LineChart;
    const DataComponent = type === 'area' ? Area : Line;

    return (
        <div className="metric-chart glass-card">
            <h4 className="chart-title">{title}</h4>
            <ResponsiveContainer width="100%" height={250}>
                <ChartComponent data={data}>
                    <defs>
                        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="time"
                        stroke="var(--text-muted)"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        style={{ fontSize: '0.75rem' }}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <DataComponent
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fill={type === 'area' ? `url(#gradient-${dataKey})` : 'none'}
                        dot={{ fill: color, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
};

export default MetricChart;
