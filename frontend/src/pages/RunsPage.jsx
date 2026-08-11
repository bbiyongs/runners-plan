// src/pages/RunsPage.jsx
import React from 'react';
import { Plus, Trash2, Filter, Heart, Eye, ChevronDown, RefreshCw } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import RunCreateModal from '../components/dashboard/RunCreateModal';
import RunDetailModal from '../components/dashboard/RunDetailModal';
import { useRuns } from '../hooks/useRuns';
import { formatDuration, getRpeLabel } from '../utils/formatters';
import '../styles/RunsPage.css';

export default function RunsPage() {
  // 💡 비즈니스 로직은 custom hook 하나로 깔끔하게 호출!
  const {
    runs,
    totalCount,
    visibleCount,
    hasMore,
    handleLoadMore,
    loading,
    syncGarmin,
    syncingGarmin,
    filter,
    isModalOpen,
    setIsModalOpen,
    selectedRun,
    isDetailOpen,
    setIsDetailOpen,
    openDetail,
    handleFilterChange,
    createRun,
    updateRun,
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
          {/* 👈 헤더 우측 버튼 그룹 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="sync-garmin-btn" 
              onClick={() => syncGarmin(1)} 
              disabled={syncingGarmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 1.1rem',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: syncingGarmin ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw size={16} className={syncingGarmin ? 'spin' : ''} />
              {syncingGarmin ? '가민 동기화 중...' : '최신 가민 동기화'}
            </button>
            <button className="add-run-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> 새 기록 등록
            </button>
          </div>
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
          <>
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
                    <tr key={run.runRecordId} style={{ cursor: 'pointer' }}>
                      <td onClick={() => openDetail(run.runRecordId)}>{run.runDate}</td>
                      <td onClick={() => openDetail(run.runRecordId)}><strong>{run.distanceKm} km</strong></td>
                      <td onClick={() => openDetail(run.runRecordId)}>{formatDuration(run.durationSec)}</td>
                      <td onClick={() => openDetail(run.runRecordId)}>{run.formattedPace || '-'}</td>
                      <td onClick={() => openDetail(run.runRecordId)}>
                        {run.avgHr ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: '600' }}>
                            <Heart size={14} fill="var(--danger)" /> {run.avgHr} bpm
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td onClick={() => openDetail(run.runRecordId)}><span className="badge-training">{run.trainingTypeCode}</span></td>
                      <td onClick={() => openDetail(run.runRecordId)}>{getRpeLabel(run.rpe)}</td>
                      <td onClick={() => openDetail(run.runRecordId)}>{run.memo || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="delete-icon-btn" onClick={() => openDetail(run.runRecordId)} style={{ color: 'var(--primary)' }}>
                            <Eye size={16} />
                          </button>
                          <button className="delete-icon-btn" onClick={(e) => { e.stopPropagation(); deleteRun(run.runRecordId); }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalCount > 0 && (
            <div className='load-more-container'>
              {hasMore? (
                <button className='load-more-btn' onClick={handleLoadMore}>
                  <ChevronDown size={18} />
                  더보기 ({Math.min(visibleCount, totalCount)}/{totalCount})
                </button>
              ): (
                <span className='all-loaded-text'>모든 기록을 불러왔습니다. (총 {totalCount}개)</span>
              )}
            </div>
          )}
          </>
        )}

        {/* 분리된 모달 컴포넌트 */}
        <RunCreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createRun}
        />

        <RunDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          runRecord={selectedRun}
          onUpdate={updateRun}
        />
      </main>
    </div>
  );
}