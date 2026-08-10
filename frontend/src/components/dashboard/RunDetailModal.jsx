import React, { useState, useEffect } from "react";
import { weatherApi } from "../../api/weatherApi";

export default function RunDetailModal({ isOpen, onClose, runRecord, onUpdate }) {
    const [locations, setLocations] = useState([]);
    const [weatherLoading, setWeatherLoading] = useState(false);


    const [formData, setFormData] = useState({
        runDate: '',
        runTime: '07:00',
        location: '서울/수도권 북부',
        distanceKm: '',
        hours: '0',
        minutes: '0',
        seconds: '0',
        avgHr: '',
        trainingTypeCode: 'EASY',
        rpe: '3',
        temperature:'',
        humidity: '',
        weatherCode: 'SUNNY',
        memo: '',
    });

    // 1. 모달 오픈 시 DB 지역 목록 가져오기
    useEffect(() => {
        if (isOpen) {
            weatherApi.getLocationList().then((list) => {
                if (list && list.length > 0) setLocations(list);
            });
        }
    }, [isOpen]);

    // 기록 데이터가 바뀔때마다 폼에 채워넣음
    useEffect(() => {
        if (runRecord) {
            const datetime = runRecord.runDatetime ? new Date(runRecord.runDatetime) : null;
            const dateStr = runRecord.runDate || (datetime ? datetime.toISOString().split('T')[0] : '');
            const timeStr = datetime ? `${String(datetime.getHours()).padStart(2, '0')}:${String(datetime.getMinutes()).padStart(2, '0')}` : '07:00';

            const sec = runRecord.durationSec || 0;
            const hrs = Math.floor(sec / 3600);
            const mins = Math.floor((sec % 3600) / 60);
            const secs = sec % 60;

            setFormData({
                runDate: dateStr,
                runTime: timeStr,
                location : runRecord.location || '서울/수도권 북부',
                distanceKm: runRecord.distanceKm || '',
                hours: String(hrs),
                minutes: String(mins),
                seconds: String(secs),
                avgHr: runRecord.avgHr ? String(runRecord.avgHr) : '',
                trainingTypeCode: runRecord.trainingTypeCode || 'EASY',
                rpe: runRecord.rpe ? String(runRecord.rpe) : '3',
                temperature : runRecord.temperature ?? '',
                humidity : runRecord.humidity ?? '',
                weatherCode : runRecord.weatherCode ?? 'SUNNY',
                memo: runRecord.memo || '',
            });
        }
    }, [runRecord]);

    const fetchWeather = async (loc, date, time) => {
        setWeatherLoading(true);
        const data = await weatherApi.lookupWeather(loc, date, time);
        if(data) {
            setFormData((prev)=> ({
                ...prev,
                temperature: data.temperature ?? '',
                humidity: data.humidity ?? '',
                weatherCode: data.weatherCode ?? 'SUNNY'
            }));
        }
        setWeatherLoading(false);
    }

    if (!isOpen || !runRecord) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            // 지역, 날짜, 시간 변경 시 날씨 자동 업데이트
            if (name === 'location' || name === 'runDate' || name === 'runTime') {
                fetchWeather(next.location, next.runDate, next.runTime);
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onUpdate(runRecord.runRecordId, formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3 className="modal-title">러닝 기록 상세 및 수정</h3>
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

                        {/* 💡 지역 선택 */}
                        <div className="input-group">
                            <label className="input-label">러닝 지역</label>
                            <select name="location" className="modal-input" value={formData.location} onChange={handleChange}>
                                {locations.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                        {/* 💡 날씨 상태 및 기온/습도 */}
                        <div className="input-group">
                            <label className="input-label">날씨 상태 {weatherLoading && '(조회 중...)'}</label>
                            <div className="weather-input-row">
                                <select name="weatherCode" className="modal-input" value={formData.weatherCode} onChange={handleChange}>
                                    <option value="SUNNY">☀️ 맑음</option>
                                    <option value="CLOUDY">☁️ 흐림</option>
                                    <option value="RAIN">🌧️ 비</option>
                                    <option value="SNOW">❄️ 눈</option>
                                </select>
                                <input type="number" step="0.1" name="temperature" placeholder="기온(°C)" className="modal-input" value={formData.temperature} onChange={handleChange} />
                                <input type="number" name="humidity" placeholder="습도(%)" className="modal-input" value={formData.humidity} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">러닝 거리 (km)</label>
                            <input type="number" step="0.01" name="distanceKm" className="modal-input" value={formData.distanceKm} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">평균 심박수 (bpm)</label>
                            <input type="number" name="avgHr" placeholder="선택사항" className="modal-input" value={formData.avgHr} onChange={handleChange} />
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
                            <textarea name="memo" rows="2" className="modal-input" value={formData.memo} onChange={handleChange} style={{ resize: 'none' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button type="submit" className="submit-btn" style={{ flex: 1 }}>
                            수정 내용 저장
                        </button>
                        <button type="button" onClick={onClose} className="submit-btn" style={{ backgroundColor: 'var(--text-muted)', flex: 1 }}>
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}