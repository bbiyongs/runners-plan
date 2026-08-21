import React from 'react';
import { WEATHER_MAP, CONDITION_OPTIONS, PAIN_AREA_MAP, PAIN_LEVEL_OPTIONS } from '../../constants/runningConstants';

export default function RunForm({ formData, shoes = [], onChange, onSubmit, onCancel, isEdit = false, submitting = false }) {
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

            {/* 2. 거리 및 심박수 (평균 / 최대) */}
            <div className="run-form-row" style={{ gridTemplateColumns: '1.2fr 1fr 1fr' }}>
                <div>
                    <label className="run-form-label">달린 거리 (km) *</label>
                    <input type="number" step="0.01" name="distanceKm" value={formData.distanceKm} onChange={onChange} placeholder="예: 5.25" required className="run-form-input" />
                </div>
                <div>
                    <label className="run-form-label">평균 심박수 (bpm)</label>
                    <input type="number" name="avgHr" min="30" max="250" value={formData.avgHr || ''} onChange={onChange} placeholder="예: 148" className="run-form-input" />
                </div>
                <div>
                    <label className="run-form-label">최대 심박수 (bpm)</label>
                    <input type="number" name="maxHr" min="30" max="250" value={formData.maxHr || ''} onChange={onChange} placeholder="예: 172" className="run-form-input" />
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

            {/* 4. 슬로우 러닝 컨디션 & 통증 부위 */}
            <div className="run-form-row">
                <div>
                    <label className="run-form-label">컨디션 점수 *</label>
                    <select name="conditionScore" value={formData.conditionScore} onChange={onChange} className="run-form-select">
                        {CONDITION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="run-form-label">통증 부위 *</label>
                    <select name="painAreaCode" value={formData.painAreaCode} onChange={onChange} className="run-form-select">
                        {Object.entries(PAIN_AREA_MAP).map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 4-1. 통증 강도 */}
            <div className="run-form-group">
                <label className="run-form-label">통증 강도 (부상 위험도) *</label>
                <select name="painLevel" value={formData.painLevel} onChange={onChange} className="run-form-select">
                    {PAIN_LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* 5. 날씨, 기온 & 습도 */}
            <div className="run-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
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
                <div>
                    <label className="run-form-label">습도 (%)</label>
                    <input type="number" name="humidity" value={formData.humidity || ''} onChange={onChange} placeholder="예: 60" className="run-form-input" />
                </div>
            </div>

            {/* 6. 착용 러닝화 선택 */}
            <div className="run-form-group">
                <label className="run-form-label">👟 착용 러닝화</label>
                <select name="shoeId" value={formData.shoeId || ''} onChange={onChange} className="run-form-select">
                    <option value="">신발 선택 안 함</option>
                    {shoes.map((shoe) => (
                        <option key={shoe.shoeId} value={shoe.shoeId}>
                            {shoe.isDefault ? '[대표] ' : ''}{shoe.shoeName} ({shoe.currentDistanceKm}km / {shoe.maxDistanceKm}km)
                        </option>
                    ))}
                </select>
            </div>

            {/* 7. 메모 */}
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