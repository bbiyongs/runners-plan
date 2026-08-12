import React from "react";
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

export default function TrainingTrendChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                시각화할 훈련량 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '320px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="run_date"
                        tickLine={false}
                        axisLine={false}
                        stroke="#64748b"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        stroke="#64748b"
                        style={{ fontSize: '0.75rem' }}
                        unit="km"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }}
                        formatter={(value, name) => [
                            `${value} km`,
                            name === 'distance_km' ? '당일 거리' : (name === 'rolling_7d_distance' ? '7일 이동평균' : '30일 이동평균')
                        ]}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: '10px', fontSize: '0.85rem' }}
                    />
                    {/* 1. 일별 달린 거리 (막대 그래프) */}
                    <Bar
                        dataKey="distance_km"
                        name="일별 거리"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={18}
                    />
                    {/* 2. 7일 이동 평균 (주황색 꺾은선) */}
                    <Line
                        type="monotone"
                        dataKey="rolling_7d_distance"
                        name="7일 이동평균"
                        stroke="#ff7300"
                        strokeWidth={2.5}
                        dot={false}
                    />
                    {/* 3. 30일 이동 평균 (초록색 꺾은선) */}
                    <Line
                        type="monotone"
                        dataKey="rolling_30d_distance"
                        name="30일 이동평균"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}