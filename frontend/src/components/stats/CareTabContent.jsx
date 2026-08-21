import React from 'react';
import AcwrRiskCard from './AcwrRiskCard';
import CoachActionCard from './CoachActionCard';
import HrZoneCard from './HrZoneCard';
import PerformanceHeatmapCard from './PerformanceHeatCard';
import ShoeLifeCard from '@/components/shoes/ShoeLifeCard';

export default function CareTabContent({ data }) {
    return (
        <div>
            {/* 1층: 부상 방지 & 코칭 & 심박 카드 그리드 */}
            <div className="card-grid-3col">
                <AcwrRiskCard acwrData={data?.acwr} />
                <CoachActionCard coachData={data?.coach_recommendation} />
                <HrZoneCard zoneData={data?.hr_zones} />
            </div>

            {/* 2층: 러닝화 수명 위젯 */}
            <div style={{ marginTop: '1.5rem' }}>
                <ShoeLifeCard />
            </div>

            {/* 3층: 히트맵 */}
            <div className="mt-6">
                <PerformanceHeatmapCard heatmapData={data?.heatmap} />
            </div>
        </div>
    );
}