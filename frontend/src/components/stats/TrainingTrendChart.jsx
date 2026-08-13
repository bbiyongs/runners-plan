import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrainingTrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                트렌드를 분석할 러닝 기록이 없습니다.
            </div>
        );
    }

    const formatTooltipValue = (value, name, item) => {
        if (item.dataKey === 'distance_km') return [`${value} km`, '일별 거리'];
        if (item.dataKey === 'rolling_7d_distance') return [`${value} km`, '7일 이동평균'];
        if (item.dataKey === 'rolling_30d_distance') return [`${value} km`, '30일 이동평균'];
        if (item.dataKey === 'avg_hr') return [value ? `${value} bpm` : '기록 없음', '평균 심박수'];
        return [value, name];
    };

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="run_date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />

                    {/* 왼쪽 Y축: 거리 (km) */}
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} unit="km" axisLine={false} tickLine={false} />

                    {/* 💡 오른쪽 Y축: 심박수 (bpm) - 데이터 범위에 맞게 자동 스케일링 */}
                    <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#ef4444' }} unit="bpm" axisLine={false} tickLine={false} />

                    <Tooltip formatter={formatTooltipValue} contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.85rem' }} />

                    {/* 일별 거리 Bar */}
                    <Bar yAxisId="left" dataKey="distance_km" name="일별 거리" fill="#3b82f6" opacity={0.6} radius={[4, 4, 0, 0]} />

                    {/* 이동평균 Line */}
                    <Line yAxisId="left" type="monotone" dataKey="rolling_7d_distance" name="7일 이동평균" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="rolling_30d_distance" name="30일 이동평균" stroke="#6366f1" strokeWidth={2} dot={false} />

                    {/* 💡 심박수 추이 Line (connectNulls + 빨간 점 표시로 시각화 보완!) */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avg_hr"
                        name="평균 심박수"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#ef4444' }}
                        connectNulls={true}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrainingTrendChart;