// src/pages/RunsPage.jsx
import React from 'react';
import { Plus, Trash2, Filter, Heart } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import RunCreateModal from '../components/dashboard/RunCreateModal';
import { useRuns } from '../hooks/useRuns';
import { formatDuration, getRpeLabel } from '../utils/formatters';
import '../styles/RunsPage.css';

export default function RunsPage() {
  // 💡 비즈니스 로직은 custom hook 하나로 깔끔하게 호출!
  const {
    runs,
    loading,
    filter,
    isModalOpen,
    setIsModalOpen,
    handleFilterChange,
    createRun,
    deleteRun,
  } = useRuns();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        <header className="runs-header">
          <div>
            <h1 className="dashboard-title">러닝 기록</h1>
            <p className="dashboard-subtitle">나의 러닝 활동 기록을 체계적으로 관리합니다</p>
          </div>
          <button className="add-run-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> 새 기록 등록
          </button>
        </header>

        {/* 날짜 범위 검색 필터 */}
        <div className="filter-bar">
          <div className="filter-item">
            <Filter size={16} color="var(--text-muted)" />
            <span>조회 기간:</span>
            <input type="date" name="startDate" className="filter-input" value={filter.startDate} onChange={handleFilterChange} />
            <span>~</span>
            <input type="date" name="endDate" className="filter-input" value={filter.endDate} onChange={handleFilterChange} />
          </div>
        </div>

        {/* 목록 테이블 */}
        {loading ? (
          <div style={{ padding: '20px' }}>기록 목록을 불러오는 중입니다...</div>
        ) : (
          <div className="runs-table-card">
            <table className="runs-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>거리</th>
                  <th>운동 시간</th>
                  <th>평균 페이스</th>
                  <th>평균 심박수</th>
                  <th>훈련 유형</th>
                  <th>운동 강도(RPE)</th>
                  <th>메모</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      해당 기간에 등록된 러닝 기록이 없습니다.
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr key={run.runRecordId}>
                      <td>{run.runDate}</td>
                      <td><strong>{run.distanceKm} km</strong></td>
                      <td>{formatDuration(run.durationSec)}</td>
                      <td>{run.formattedPace || '-'}</td>
                      <td>
                        {run.avgHr ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: '600' }}>
                            <Heart size={14} fill="var(--danger)" /> {run.avgHr} bpm
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td><span className="badge-training">{run.trainingTypeCode}</span></td>
                      <td>{getRpeLabel(run.rpe)}</td>
                      <td>{run.memo || '-'}</td>
                      <td>
                        <button className="delete-icon-btn" onClick={() => deleteRun(run.runRecordId)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 분리된 모달 컴포넌트 */}
        <RunCreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createRun}
        />
      </main>
    </div>
  );
}