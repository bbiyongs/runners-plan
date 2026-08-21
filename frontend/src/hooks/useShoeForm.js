// src/hooks/useShoeForm.js
import { useState, useEffect, useCallback, useRef } from "react";
import { shoeApi } from "@/api/shoeApi";

export function useShoeForm(initialState, isOpen, editingShoe = null) {
    const [formData, setFormData] = useState(initialState);
    const [previewInfo, setPreviewInfo] = useState({
        loading: false,
        totalPeriodDistanceKm: 0,
        usageRatio: 0.7,
        estimatedDistanceKm: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    // 최신 요청 식별자 (경쟁 상태 방지)
    const requestIdRef = useRef(0);

    // 과거 누적 거리 프리뷰 API 호출 함수
    const fetchPreview = useCallback(async (purchasedDate, usageRatio) => {
        if (!purchasedDate || !/^\d{4}-\d{2}-\d{2}$/.test(purchasedDate)) {
            return;
        }

        const currentReqId = ++requestIdRef.current;
        setPreviewInfo((prev) => ({ ...prev, loading: true }));

        try {
            const ratioNum = parseFloat(usageRatio) || 0.7;
            const data = await shoeApi.previewDistance(purchasedDate, ratioNum);

            // 다른 요청이 뒤이어 시작되었다면 무시
            if (currentReqId !== requestIdRef.current) return;

            const res = data?.data !== undefined ? data.data : data;
            const rawTotal = res?.totalPeriodDistanceKm ?? res?.total_period_distance_km ?? 0;
            const rawEstimated = res?.estimatedDistanceKm ?? res?.estimated_distance_km ?? 0;
            const rawRatio = res?.usageRatio ?? res?.usage_ratio ?? ratioNum;

            const totalPeriod = Number(parseFloat(rawTotal).toFixed(1)) || 0;
            const estimated = Number(parseFloat(rawEstimated).toFixed(1)) || 0;

            setPreviewInfo({
                loading: false,
                totalPeriodDistanceKm: totalPeriod,
                usageRatio: rawRatio,
                estimatedDistanceKm: estimated,
            });

            // 자동 추천 거리를 initialDistanceKm 입력값에 반영
            setFormData((prev) => ({
                ...prev,
                initialDistanceKm: String(estimated)
            }));
        } catch (error) {
            if (currentReqId === requestIdRef.current) {
                console.warn("과거 거리 프리뷰 조회 오류(기본값 유지):", error);
                setPreviewInfo((prev) => ({
                    ...prev,
                    loading: false,
                }));
            }
        }
    }, []);

    // 모달 열림 또는 대상 러닝화 변경 시 초기화
    useEffect(() => {
        if (!isOpen) return;

        if (editingShoe) {
            setFormData({
                shoeName: editingShoe.shoeName || '',
                brand: editingShoe.brand || 'Nike',
                purchasedDate: editingShoe.purchasedDate || '',
                usageRatio: 0.7,
                initialDistanceKm: editingShoe.currentDistanceKm != null ? String(editingShoe.currentDistanceKm) : '0',
                maxDistanceKm: editingShoe.maxDistanceKm != null ? String(editingShoe.maxDistanceKm) : '600',
                isDefault: Boolean(editingShoe.isDefault),
            });
            setPreviewInfo({
                loading: false,
                totalPeriodDistanceKm: 0,
                usageRatio: 0.7,
                estimatedDistanceKm: editingShoe.currentDistanceKm || 0,
            });
        } else {
            setFormData(initialState);
            // 초기 구매일로 프리뷰 조회
            if (initialState.purchasedDate) {
                fetchPreview(initialState.purchasedDate, initialState.usageRatio || 0.7);
            }
        }
    }, [isOpen, editingShoe, fetchPreview]);

    // 일반 입력 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const nextValue = type === 'checkbox' ? checked : value;

        setFormData((prev) => ({ ...prev, [name]: nextValue }));

        // 구매일 변경 시 프리뷰 재계산
        if (name === 'purchasedDate' && !editingShoe && nextValue) {
            fetchPreview(nextValue, formData.usageRatio);
        }
    };

    // 착용 비중 버튼 클릭 핸들러
    const handleRatioSelect = (ratio) => {
        setFormData((prev) => ({ ...prev, usageRatio: ratio }));
        if (!editingShoe && formData.purchasedDate) {
            fetchPreview(formData.purchasedDate, ratio);
        }
    };

    return {
        formData,
        setFormData,
        previewInfo,
        submitting,
        setSubmitting,
        handleChange,
        handleRatioSelect,
        fetchPreview,
    };
}
