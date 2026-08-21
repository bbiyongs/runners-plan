import { useState, useEffect } from "react";
import { weatherApi } from "../api/weatherApi";
import { shoeApi } from "../api/shoeApi";

export function useRunForm(initialState, isOpen, runRecord = null) {
    const [formData, setFormData] = useState(initialState);
    const [locations, setLocations] = useState([]);
    const [shoes, setShoes] = useState([]);
    const [weatherLoading, setWeatherLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            weatherApi.getLocationList().then((list) => {
                if (list && list.length > 0) {
                    setLocations(list);
                    fetchWeather(list[0], formData.runDate, formData.runTime);
                }
            });

            // 러닝화 목록 조회 및 신규 등록 시 기본 대표 신발 자동 세팅
            shoeApi.getShoes(false).then((shoeList) => {
                if (shoeList && shoeList.length > 0) {
                    setShoes(shoeList);
                    if (!runRecord) {
                        const defaultShoe = shoeList.find((s) => s.isDefault);
                        if (defaultShoe) {
                            setFormData((prev) => ({
                                ...prev,
                                shoeId: prev.shoeId || String(defaultShoe.shoeId)
                            }));
                        }
                    }
                }
            }).catch((err) => console.warn("러닝화 목록 조회 실패:", err));
        }
    }, [isOpen]);

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
                location: runRecord.location || '서울/수도권 북부',
                distanceKm: runRecord.distanceKm || '',
                hours: String(hrs),
                minutes: String(mins),
                seconds: String(secs),
                avgHr: runRecord.avgHr ? String(runRecord.avgHr) : '',
                maxHr: runRecord.maxHr ? String(runRecord.maxHr) : '',
                conditionScore: runRecord.conditionScore ?? 2,
                painAreaCode: runRecord.painAreaCode || 'NONE',
                painLevel: runRecord.painLevel ?? 0,
                temperature: runRecord.temperature ?? '',
                humidity: runRecord.humidity ?? '',
                weatherCode: runRecord.weatherCode ?? 'SUNNY',
                shoeId: runRecord.shoeId ? String(runRecord.shoeId) : '',
                memo: runRecord.memo || '',
            });
        } else if (isOpen) {
            setFormData(initialState);
        }
    }, [runRecord, isOpen]);

    // 날씨 자동 조회
    const fetchWeather = async (loc, date, time) => {
        setWeatherLoading(true);
        const data = await weatherApi.lookupWeather(loc, date, time);
        if (data) {
            setFormData((prev) => ({
                ...prev,
                temperature: data.temperature ?? '',
                humidity: data.humidity ?? '',
                weatherCode: data.weatherCode ?? 'SUNNY'
            }));
        }
        setWeatherLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === 'location' || name === 'runDate' || name === 'runTime') {
                fetchWeather(
                    name === 'location' ? value : next.location,
                    name === 'runDate' ? value : next.runDate,
                    name === 'runTime' ? value : next.runTime
                );
            }
            return next;
        });
    };

    return {
        formData,
        setFormData,
        locations,
        shoes,
        weatherLoading,
        handleChange
    }
}