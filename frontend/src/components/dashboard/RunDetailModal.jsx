import React, { useState, useEffect } from "react";
import { weatherApi } from "@/api/weatherApi";
import RunForm from "./RunForm";
import { useRunForm } from "@/hooks/useRunForm";

export default function RunDetailModal({ isOpen, onClose, runRecord, onUpdate }) {

    const { formData, shoes, weatherLoading, handleChange } = useRunForm({
        runDate: '',
        runTime: '07:00',
        location: '서울/수도권 북부',
        distanceKm: '',
        hours: '0',
        minutes: '0',
        seconds: '0',
        avgHr: '',
        maxHr: '',
        conditionScore: 2,
        painAreaCode: 'NONE',
        painLevel: 0,
        temperature: '',
        humidity: '',
        weatherCode: 'SUNNY',
        shoeId: '',
        memo: '',
    }, isOpen, runRecord);

    if (!isOpen || !runRecord) return null;

    const handleSubmit = async (e) => {
        e.preventDefault()
        await onUpdate(runRecord.runRecordId, formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3 className="modal-title">러닝 기록 상세 및 수정</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                    <RunForm
                        formData={formData}
                        shoes={shoes}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isEdit={true}
                        submitting={weatherLoading}
                    />
            </div>
        </div>
    );
}