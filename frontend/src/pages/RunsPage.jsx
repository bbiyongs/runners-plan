import React, {useState, useEffect} from "react";
import {Plus, Trash2, Filter } from 'lucide-react';
import Sidebar from "../components/layout/Sidebar";
import { runApi } from "../api/runApi";
import { formatDuration, getRpeLabel } from "../utils/formatters";
import '../styles/RunsPage.css';

export default function RunPage() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 날짜 필터 상태 
    const todayStr = new Date().toISOString().split('T')[0];
    const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [filter, setFilter] = useState({
        startDate: firstDayStr,
        endDate: todayStr,
    })

    // 등록 폼 입력상태
    const [formData, setFormData] = useState({
        runData: todayStr,
        runTime: '07:00',
        distanceKm : '',
        hours:'0',
        minutes:'30',
        seconds:'0',
        trainingTypeCode: 'EASY',
        rpe: '3',
        memo: '',
    });

    // 러닝기록 불러오기
    const fetchRuns = async() => {
        try {
            setLoading(true);
            const data = await runApi.getMyRunRecords(filter.startDate, filter.endDate);
            setRuns(data || []);
        } catch (err) {
            console.error('러닝기록 로드 실패 : ', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRuns();
    }, [filter.startDate, filter.endDate]);

    // 입력 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilter((prev) => ({...prev,[name]:value}));
    }

    // 러닝 기록 등록 제출
    const handleSubmit = async(e)=> {
        e.preventDefault();
        try {
            // localdatetime 형식 생성
            const runDatetime = `${formData.runDate}T${formData.runTime}:00`;

            const totalSec = (parseInt(formData.hours || '0', 10) * 3600) + 
                            (parseInt(formData.minutes || '0', 10) * 60) + 
                            parseInt(formData.seconds || '0', 10);

            if (totalSec <= 0) {
                alert('운동 시간을 1초 이상 입력해주세요.');
                return;
            }

            const requestPayload = {
                runDatetime: runDatetime,
                distanceKm: parseFloat(formData.distanceKm),
                durationSec: totalSec,
                trainingTypeCode: formData.trainingTypeCode,
                rpe : parseInt(formData.rpe, 10),
                memo: formData.memo,
            };

            await runApi.createRunRecord(requestPayload);
            alert('러닝 기록이 등록되었습니다.');
            setIsModalOpen(false);

            // 폼 초기화 후 목록 재조회
            setFormData({
                runDate: todayStr,
                runTime: '07:00',
                distanceKm: '',
                hours: '0',
                minutes: '30',
                seconds: '0',
                trainingTypeCode: 'EASY',
                rpe: '3',
                memo: '',
            });

            fetchRuns();
        } catch (err) {
            alert('기록 등록에 실패했습니다.')
        }
    };

    // 삭제
    const handleDelete = async(id) => {
        if(window.confirm('이 기록을 삭제하시겠습니까?')){
            try {
                await runApi.deleteRunRecord(id);
                fetchRuns();
            } catch(err) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

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
        {/* 날짜 범위 검색 필터 바 */}
        <div className="filter-bar">
          <div className="filter-item">
            <Filter size={16} color="var(--text-muted)" />
            <span>조회 기간:</span>
            <input
              type="date"
              name="startDate"
              className="filter-input"
              value={filter.startDate}
              onChange={handleFilterChange}
            />
            <span>~</span>
            <input
              type="date"
              name="endDate"
              className="filter-input"
              value={filter.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
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
                  <th>훈련 유형</th>
                  <th>운동 강도(RPE)</th>
                  <th>메모</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
                        <span className="badge-training">{run.trainingTypeCode}</span>
                      </td>
                      <td>{getRpeLabel(run.rpe)}</td>
                      <td>{run.memo || '-'}</td>
                      <td>
                        <button className="delete-icon-btn" onClick={() => handleDelete(run.runRecordId)}>
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
        {/* 신규 기록 등록 모달 */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 className="modal-title">새 러닝 기록 등록</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">러닝 일자</label>
                    <input
                      type="date"
                      name="runDate"
                      className="modal-input"
                      value={formData.runDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">시작 시간</label>
                    <input
                      type="time"
                      name="runTime"
                      className="modal-input"
                      value={formData.runTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group form-full">
                    <label className="input-label">러닝 거리 (km)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="distanceKm"
                      placeholder="예: 5.25"
                      className="modal-input"
                      value={formData.distanceKm}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* 시간 / 분 / 초 3분할 입력 */}
                  <div className="input-group form-full">
                    <label className="input-label">운동 시간 (시간 / 분 / 초)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        name="hours"
                        className="modal-input"
                        value={formData.hours}
                        onChange={handleChange}
                        style={{ width: '80px' }}
                      />
                      <span>시간</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        name="minutes"
                        className="modal-input"
                        value={formData.minutes}
                        onChange={handleChange}
                        style={{ width: '80px' }}
                      />
                      <span>분</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        name="seconds"
                        className="modal-input"
                        value={formData.seconds}
                        onChange={handleChange}
                        style={{ width: '80px' }}
                      />
                      <span>초</span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">훈련 유형</label>
                    <select
                      name="trainingTypeCode"
                      className="modal-input"
                      value={formData.trainingTypeCode}
                      onChange={handleChange}
                    >
                      <option value="EASY">조깅 / 조이런 (EASY)</option>
                      <option value="TEMPO">템포런 (TEMPO)</option>
                      <option value="INTERVAL">인터벌 (INTERVAL)</option>
                      <option value="LONG">LSD / 장거리 (LONG)</option>
                      <option value="RACE">대회 (RACE)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">운동 강도 (RPE 1~10)</label>
                    <select
                      name="rpe"
                      className="modal-input"
                      value={formData.rpe}
                      onChange={handleChange}
                    >
                      <option value="1">1 (매우 쉬움)</option>
                      <option value="2">2 (편안함)</option>
                      <option value="3">3 (보통)</option>
                      <option value="4">4 (약간 힘듦)</option>
                      <option value="5">5 (힘듦)</option>
                      <option value="6">6 (숨참)</option>
                      <option value="7">7 (매우 힘듦)</option>
                      <option value="8">8 (고강도)</option>
                      <option value="9">9 (최고 강도)</option>
                      <option value="10">10 (한계 도달)</option>
                    </select>
                  </div>
                  <div className="input-group form-full">
                    <label className="input-label">메모</label>
                    <textarea
                      name="memo"
                      rows="2"
                      placeholder="오늘 러닝의 코스, 컨디션 등을 메모해 보세요"
                      className="modal-input"
                      value={formData.memo}
                      onChange={handleChange}
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">
                  등록하기
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}