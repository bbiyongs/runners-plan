// src/components/dashboard/RunForm.jsx
import React from 'react';
import { TRAINING_TYPE_MAP, WEATHER_MAP, RPE_OPTIONS } from '../../constants/runningConstants';

export default function RunForm({ formData, onChange, onSubmit, onCancel, isEdit = false, submitting = false }) {
    return (
        <form onSubmit={onSubmit} className="run-form">
            {/* 1. 날짜 및 시간 */}
            <div className="run-form-row">
                <div>
                    <label className="run-form-label">운동 날짜 *</label>
                    <input type="date" name="runDate" value={formData.runDate} onChange={onChange} required className="run-form-input" />
                </div>
                <div>
                    <label className="run-form-label">시작 시간 *</label>
                    <input type="time" name="runTime" value={formData.runTime} onChange={onChange} required className="run-form-input" />
                </div>
            </div>

            {/* 2. 거리 및 심박수 */}
            <div className="run-form-row">
                <div>
                    <label className="run-form-label">달린 거리 (km) *</label>
                    <input type="number" step="0.01" name="distanceKm" value={formData.distanceKm} onChange={onChange} placeholder="예: 5.25" required className="run-form-input" />
                </div>
                <div>
                    <label className="run-form-label">평균 심박수 (bpm)</label>
                    <input type="number" name="avgHr" value={formData.avgHr || ''} onChange={onChange} placeholder="예: 148" className="run-form-input" />
                </div>
            </div>

            {/* 3. 소요 시간 (시, 분, 초) */}
            <div className="run-form-group">
                <label className="run-form-label">운동 소요 시간 *</label>
                <div className="duration-inputs">
                    <input type="number" name="hours" value={formData.hours} onChange={onChange} placeholder="0" min="0" className="duration-input-num" /> 시
                    <input type="number" name="minutes" value={formData.minutes} onChange={onChange} placeholder="0" min="0" max="59" className="duration-input-num" /> 분
                    <input type="number" name="seconds" value={formData.seconds} onChange={onChange} placeholder="0" min="0" max="59" className="duration-input-num" /> 초
                </div>
            </div>

            {/* 4. 훈련 유형 & RPE 운동 강도 */}
            <div className="run-form-row">
                <div>
                    <label className="run-form-label">훈련 유형 *</label>
                    <select name="trainingTypeCode" value={formData.trainingTypeCode} onChange={onChange} className="run-form-select">
                        {Object.entries(TRAINING_TYPE_MAP).map(([code, name]) => (
                            <option key={code} value={code}>{name} ({code})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="run-form-label">운동 강도 (RPE 1~10) *</label>
                    <select name="rpe" value={formData.rpe} onChange={onChange} className="run-form-select">
                        {RPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 5. 날씨 & 기온 */}
            <div className="run-form-row">
                <div>
                    <label className="run-form-label">날씨</label>
                    <select name="weatherCode" value={formData.weatherCode || 'SUNNY'} onChange={onChange} className="run-form-select">
                        {Object.entries(WEATHER_MAP).map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="run-form-label">기온 (°C)</label>
                    <input type="number" step="0.1" name="temperature" value={formData.temperature || ''} onChange={onChange} placeholder="예: 21.5" className="run-form-input" />
                </div>
            </div>

            {/* 6. 메모 */}
            <div className="run-form-group">
                <label className="run-form-label">러닝 메모</label>
                <textarea name="memo" value={formData.memo || ''} onChange={onChange} rows="3" placeholder="오늘의 훈련 느낌이나 상태를 기록하세요..." className="run-form-textarea" />
            </div>

            {/* 7. 액션 버튼 그룹 */}
            <div className="run-form-actions">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-form-cancel">
                        취소
                    </button>
                )}
                <button type="submit" disabled={submitting} className={`btn-form-submit ${isEdit ? 'edit' : 'create'}`}>
                    {submitting ? '처리 중...' : isEdit ? '러닝 기록 수정' : '러닝 기록 등록'}
                </button>
            </div>
        </form>
    );
}