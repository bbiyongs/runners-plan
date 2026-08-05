// src/hooks/useRuns.js
import { useState, useEffect } from 'react';
import { runApi } from '../api/runApi';

export function useRuns() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];
    const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    const [filter, setFilter] = useState({
        startDate: firstDayStr,
        endDate: todayStr,
    });

    // 내 러닝 기록 목록 조회
    const fetchRuns = async () => {
        try {
            setLoading(true);
            const data = await runApi.getMyRunRecords(filter.startDate, filter.endDate);
            setRuns(data || []);
        } catch (err) {
            console.error('러닝기록 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRuns();
    }, [filter.startDate, filter.endDate]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    // 기록 등록
    const createRun = async (formData) => {
        const runDatetime = `${formData.runDate}T${formData.runTime}:00`;
        const totalSec =
            (parseInt(formData.hours || '0', 10) * 3600) +
            (parseInt(formData.minutes || '0', 10) * 60) +
            parseInt(formData.seconds || '0', 10);

        if (totalSec <= 0) {
            alert('운동 시간을 1초 이상 입력해 주세요.');
            return false;
        }

        const requestPayload = {
            runDatetime,
            distanceKm: parseFloat(formData.distanceKm),
            durationSec: totalSec,
            avgHr: formData.avgHr ? parseInt(formData.avgHr, 10) : null,
            trainingTypeCode: formData.trainingTypeCode,
            rpe: parseInt(formData.rpe, 10),
            memo: formData.memo,
        };

        await runApi.createRunRecord(requestPayload);
        alert('러닝 기록이 성공적으로 등록되었습니다!');
        setIsModalOpen(false);
        fetchRuns();
        return true;
    };

    // 기록 삭제
    const deleteRun = async (id) => {
        if (window.confirm('이 러닝 기록을 삭제하시겠습니까?')) {
            try {
                await runApi.deleteRunRecord(id);
                fetchRuns();
            } catch (err) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

    return {
        runs,
        loading,
        filter,
        isModalOpen,
        setIsModalOpen,
        handleFilterChange,
        createRun,
        deleteRun,
    };
}