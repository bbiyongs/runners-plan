// src/components/stats/CareTabContent.jsx
import React from 'react';
import AcwrRiskCard from './AcwrRiskCard';
import CoachActionCard from './CoachActionCard';
import HrZoneCard from './HrZoneCard';
import PerformanceHeatmapCard from './PerformanceHeatCard';

export default function CareTabContent({ data }) {
    return (
        <div>
            {/* 1층: 3열 카드 그리드 클래스 적용 */}
            <div className="card-grid-3col">
                <AcwrRiskCard acwrData={data?.acwr} />
                <CoachActionCard coachData={data?.coach_recommendation} />
                <HrZoneCard zoneData={data?.hr_zones} />
            </div>

            {/* 2층: 여백 클래스 적용 */}
            <div className="mt-6">
                <PerformanceHeatmapCard heatmapData={data?.heatmap} />
            </div>
        </div>
    );
}