// src/components/shoes/ShoeModal.jsx
import React from 'react';
import { SHOE_BRANDS, USAGE_RATIO_OPTIONS } from '@/constants/shoeConstants';
import { useShoeForm } from '@/hooks/useShoeForm';
import { Lightbulb } from 'lucide-react';

export default function ShoeModal({ isOpen, onClose, editingShoe, onSubmit }) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const {
        formData,
        previewInfo,
        submitting,
        setSubmitting,
        handleChange,
        handleRatioSelect,
    } = useShoeForm({
        shoeName: '',
        brand: 'Nike',
        purchasedDate: todayStr,
        usageRatio: 0.7,
        initialDistanceKm: '0',
        maxDistanceKm: '600',
        isDefault: false,
    }, isOpen, editingShoe);

    if (!isOpen) return null;

    const isEdit = Boolean(editingShoe);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        if (isEdit) {
            await onSubmit(editingShoe.shoeId, formData);
        } else {
            await onSubmit(formData);
        }
        setSubmitting(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card shoe-modal-card">
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>👟</span>
                        <h3 className="modal-title">{isEdit ? '러닝화 정보 수정' : '러닝화 등록'}</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="shoe-form">
                    {/* 1. 모델명 & 브랜드 */}
                    <div className="shoe-form-row">
                        <div className="form-group flex-2">
                            <label className="shoe-form-label">러닝화 모델명 *</label>
                            <input
                                type="text"
                                name="shoeName"
                                value={formData.shoeName}
                                onChange={handleChange}
                                placeholder="예: 나이키 인피니티 런 4"
                                required
                                className="shoe-form-input"
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label className="shoe-form-label">브랜드 *</label>
                            <select
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="shoe-form-select"
                            >
                                {SHOE_BRANDS.map((b) => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 2. 구매/착용 시작일 */}
                    <div className="form-group">
                        <label className="shoe-form-label">구매/착용 시작일 *</label>
                        <input
                            type="date"
                            name="purchasedDate"
                            value={formData.purchasedDate}
                            onChange={handleChange}
                            required
                            className="shoe-form-input"
                        />
                    </div>

                    {/* 3. 과거 누적 거리 자동 계산 박스 (신규 등록 시 표출) */}
                    {!isEdit && (
                        <div className="shoe-preview-box">
                            <div className="preview-box-header">
                                <Lightbulb size={16} color="#16a34a" />
                                <strong>과거 누적 거리 자동 계산</strong>
                            </div>
                            <p className="preview-box-desc">
                                구매일({formData.purchasedDate || '선택일'}) 이후 총 러닝 거리는{' '}
                                <strong>{previewInfo.loading ? '계산 중...' : `${previewInfo.totalPeriodDistanceKm} km`}</strong> 입니다.
                                <br />이 기간 동안 이 신발의 착용 비중을 선택하세요.
                            </p>
                            <div className="ratio-btn-group">
                                {USAGE_RATIO_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.ratio}
                                        type="button"
                                        className={`ratio-btn ${formData.usageRatio === opt.ratio ? 'active' : ''}`}
                                        onClick={() => handleRatioSelect(opt.ratio)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. 초기 누적 거리 & 목표 수명 */}
                    <div className="shoe-form-row">
                        <div className="form-group">
                            <label className="shoe-form-label">
                                {isEdit ? '현재 누적 거리 (km) *' : '초기 누적 거리 (km) *'}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                name="initialDistanceKm"
                                value={formData.initialDistanceKm}
                                onChange={handleChange}
                                placeholder="0.0"
                                required
                                className="shoe-form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="shoe-form-label">
                                목표 수명 (km) <span className="label-sub">(기본 600km)</span> *
                            </label>
                            <input
                                type="number"
                                step="10"
                                min="100"
                                name="maxDistanceKm"
                                value={formData.maxDistanceKm}
                                onChange={handleChange}
                                placeholder="600"
                                required
                                className="shoe-form-input"
                            />
                        </div>
                    </div>

                    {/* 5. 대표 러닝화 설정 체크박스 */}
                    <div className="form-checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />
                            <span>대표 러닝화로 설정</span>
                        </label>
                    </div>

                    {/* 6. 액션 버튼 */}
                    <div className="shoe-form-actions">
                        <button type="button" onClick={onClose} className="btn-shoe-cancel">
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-shoe-submit"
                        >
                            {submitting ? '저장 중...' : '저장하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
