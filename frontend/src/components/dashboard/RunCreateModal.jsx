// src/components/dashboard/RunCreateModal.jsx
import React, { useEffect, useState } from 'react';
import { weatherApi } from '../../api/weatherApi';
import RunForm from './RunForm';
import { useRunForm } from '../../hooks/useRunForm';

export default function RunCreateModal({ isOpen, onClose, onSubmit }) {
    const todayStr = new Date().toISOString().split('T')[0];

    const { formData, weatherLoading, handleChange } = useRunForm({
        runDate: todayStr,
        runTime: '07:00',
        location: '서울/수도권 북부',
        distanceKm: '',
        hours: '0',
        minutes: '30',
        seconds: '0',
        avgHr: '',
        trainingTypeCode: 'EASY',
        rpe: '3',
        temperature: '',
        humidity: '',
        weatherCode: 'SUNNY',
        memo: '',
    }, isOpen);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3 className="modal-title">새 러닝 기록 등록</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <RunForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isEdit={false}
                    submitting={weatherLoading}
                />
            </div>
        </div>
    );
}