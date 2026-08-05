// src/components/dashboard/RunCreateModal.jsx
import React, { useState } from 'react';

export default function RunCreateModal({ isOpen, onClose, onSubmit }) {
    const todayStr = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        runDate: todayStr,
        runTime: '07:00',
        distanceKm: '',
        hours: '0',
        minutes: '30',
        seconds: '0',
        avgHr: '',
        trainingTypeCode: 'EASY',
        rpe: '3',
        memo: '',
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onSubmit(formData);
        if (success) {
            setFormData({
                runDate: todayStr,
                runTime: '07:00',
                distanceKm: '',
                hours: '0',
                minutes: '30',
                seconds: '0',
                avgHr: '',
                trainingTypeCode: 'EASY',
                rpe: '3',
                memo: '',
            });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3 className="modal-title">새 러닝 기록 등록</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">러닝 일자</label>
                            <input type="date" name="runDate" className="modal-input" value={formData.runDate} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">시작 시간</label>
                            <input type="time" name="runTime" className="modal-input" value={formData.runTime} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">러닝 거리 (km)</label>
                            <input type="number" step="0.01" name="distanceKm" placeholder="예: 5.25" className="modal-input" value={formData.distanceKm} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">평균 심박수 (bpm)</label>
                            <input type="number" name="avgHr" placeholder="예: 155" className="modal-input" value={formData.avgHr} onChange={handleChange} />
                        </div>

                        <div className="input-group form-full">
                            <label className="input-label">운동 시간 (시간 / 분 / 초)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="number" min="0" name="hours" className="modal-input" value={formData.hours} onChange={handleChange} style={{ width: '70px' }} />
                                <span>시간</span>
                                <input type="number" min="0" max="59" name="minutes" className="modal-input" value={formData.minutes} onChange={handleChange} style={{ width: '70px' }} />
                                <span>분</span>
                                <input type="number" min="0" max="59" name="seconds" className="modal-input" value={formData.seconds} onChange={handleChange} style={{ width: '70px' }} />
                                <span>초</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">훈련 유형</label>
                            <select name="trainingTypeCode" className="modal-input" value={formData.trainingTypeCode} onChange={handleChange}>
                                <option value="EASY">조깅 / 조이런 (EASY)</option>
                                <option value="TEMPO">템포런 (TEMPO)</option>
                                <option value="INTERVAL">인터벌 (INTERVAL)</option>
                                <option value="LONG">LSD / 장거리 (LONG)</option>
                                <option value="RACE">대회 (RACE)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">운동 강도 (RPE 1~10)</label>
                            <select name="rpe" className="modal-input" value={formData.rpe} onChange={handleChange}>
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
                            <textarea name="memo" rows="2" placeholder="코스, 컨디션 메모" className="modal-input" value={formData.memo} onChange={handleChange} style={{ resize: 'none' }} />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">등록하기</button>
                </form>
            </div>
        </div>
    );
}