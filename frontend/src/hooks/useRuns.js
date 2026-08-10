// src/hooks/useRuns.js
import { useState, useEffect } from 'react';
import { runApi } from '../api/runApi';

export function useRuns() {
    const [allRuns, setAllRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 상세/수정 모달 상태 추가
    const [selectedRun, setSelectedRun] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // 더보기 페이징 관련
    const PAGE_SIZE = 5;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
            setAllRuns(data || []);
            setVisibleCount(PAGE_SIZE); // 검색 조건 변경 시 초기 10개로 리셋
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

    // 더보기 버튼 클릭시 10개 추가 
    const handleLoadMore = () => {
        setVisibleCount((prev)=> prev + PAGE_SIZE);
    };

    // 현재 화면에 보여줄 갯수만큼 자른 데이터 목록
    const visibleRuns = allRuns.slice(0, visibleCount);
    const hasMore = visibleCount < allRuns.length;

    // 상세정보 열기
    const openDetail = async(runRecordId) => {
        try{
            const detail = await runApi.getRunRecordDetail(runRecordId);
            setSelectedRun(detail);
            setIsDetailOpen(true);
        } catch (err) {
            alert('상세 정보를 불러오지 못했습니다.');
        }
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
            temperature: formData.temperature !== '' ? parseFloat(formData.temperature) : null,
            humidity: formData.humidity !== '' ? parseInt(formData.humidity, 10) : null,
            wetherCode: formData.wetherCode || 'SUNNY',
            memo: formData.memo,
        };

        await runApi.createRunRecord(requestPayload);
        alert('러닝 기록이 성공적으로 등록되었습니다!');
        setIsModalOpen(false);
        fetchRuns();
        return true;
    };

    // 기록 수정
    const updateRun = async(id, formData) => {
        try {
            const runDatetime = `${formData.runDate}T${formData.runTime}:00`;
            const totalSec = (parseInt(formData.hours||'0', 10) * 3600) + (parseInt(formData.minutes || '0', 10) * 60) + parseInt(formData.seconds || '0', 10);

            const requestPayload = {
                runDatetime,
                distanceKm: parseFloat(formData.distanceKm),
                durationSec: totalSec,
                avgHr: formData.avgHr? parseInt(formData.avgHr, 10) : null,
                trainingTypeCode : formData.trainingTypeCode,
                rpe: parseInt(formData.rpe, 10),
                temperature: formData.temperature !== ''? parseFloat(formData.temperature): null, 
                humidity: formData.humidity !== ''? parseInt(formData.humidity, 10) : null,
                weatherCode : formData.weatherCode || 'SUNNY',
                memo:formData.memo, 
            }

            await runApi.updateRunRecord(id, requestPayload);
            alert('러닝 기록이 성공적으로 수정되었습니다. ');
            setIsDetailOpen(false);
            setSelectedRun(null);
            fetchRuns();
        } catch (err) {
            alert('수정에 실패했습니다.');
        }
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
        runs: visibleRuns,
        totalCount: allRuns.length,
        visibleCount,
        hasMore,
        handleLoadMore,
        loading,
        filter,
        isModalOpen,
        setIsModalOpen,
        selectedRun,
        isDetailOpen,
        setIsDetailOpen,
        openDetail,
        handleFilterChange,
        createRun,
        updateRun,
        deleteRun,
    };
}