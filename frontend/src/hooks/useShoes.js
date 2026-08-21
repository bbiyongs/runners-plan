// src/hooks/useShoes.js
import { useState, useEffect, useCallback } from "react";
import { shoeApi } from "@/api/shoeApi";

export function useShoes() {
    const [shoes, setShoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [includeRetired, setIncludeRetired] = useState(false);

    // 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShoe, setEditingShoe] = useState(null);

    // 러닝화 목록 불러오기
    const fetchShoes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await shoeApi.getShoes(includeRetired);
            setShoes(data || []);
        } catch (err) {
            console.error("러닝화 목록 로드 오류:", err);
            setError("러닝화 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [includeRetired]);

    useEffect(() => {
        fetchShoes();
    }, [fetchShoes]);

    // 모달 열기 (신규 등록)
    const openCreateModal = () => {
        setEditingShoe(null);
        setIsModalOpen(true);
    };

    // 모달 열기 (수정)
    const openEditModal = (shoe) => {
        setEditingShoe(shoe);
        setIsModalOpen(true);
    };

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingShoe(null);
    };

    // 러닝화 등록 처리
    const handleCreateShoe = async (formData) => {
        try {
            const payload = {
                shoeName: formData.shoeName,
                brand: formData.brand,
                purchasedDate: formData.purchasedDate,
                maxDistanceKm: parseFloat(formData.maxDistanceKm) || 600,
                initialDistanceKm: parseFloat(formData.initialDistanceKm) || 0,
                isDefault: Boolean(formData.isDefault),
            };

            await shoeApi.createShoe(payload);
            alert("러닝화가 성공적으로 등록되었습니다!");
            closeModal();
            fetchShoes();
            return true;
        } catch (err) {
            console.error("러닝화 등록 오류:", err);
            alert(err.response?.data?.message || "러닝화 등록에 실패했습니다.");
            return false;
        }
    };

    // 러닝화 수정 처리
    const handleUpdateShoe = async (shoeId, formData) => {
        try {
            const payload = {
                shoeName: formData.shoeName,
                brand: formData.brand,
                purchasedDate: formData.purchasedDate,
                maxDistanceKm: parseFloat(formData.maxDistanceKm) || 600,
                currentDistanceKm: parseFloat(formData.initialDistanceKm) || 0,
                isDefault: Boolean(formData.isDefault),
            };

            await shoeApi.updateShoe(shoeId, payload);
            alert("러닝화 정보가 수정되었습니다.");
            closeModal();
            fetchShoes();
            return true;
        } catch (err) {
            console.error("러닝화 수정 오류:", err);
            alert(err.response?.data?.message || "러닝화 수정에 실패했습니다.");
            return false;
        }
    };

    // 대표 러닝화 설정
    const handleSetDefault = async (shoeId) => {
        try {
            await shoeApi.setDefaultShoe(shoeId);
            alert("대표 러닝화로 설정되었습니다.");
            fetchShoes();
        } catch (err) {
            console.error("대표 러닝화 설정 오류:", err);
            alert("대표 러닝화 설정에 실패했습니다.");
        }
    };

    // 러닝화 은퇴(사용 중단)
    const handleRetire = async (shoeId) => {
        if (window.confirm("이 러닝화를 은퇴(사용 중단) 처리하시겠습니까?\n은퇴 후에도 과거 러닝 기록의 통계는 보존됩니다.")) {
            try {
                await shoeApi.retireShoe(shoeId);
                alert("러닝화가 은퇴 처리되었습니다.");
                fetchShoes();
            } catch (err) {
                console.error("러닝화 은퇴 오류:", err);
                alert("러닝화 은퇴 처리에 실패했습니다.");
            }
        }
    };

    return {
        shoes,
        loading,
        error,
        includeRetired,
        setIncludeRetired,
        isModalOpen,
        editingShoe,
        openCreateModal,
        openEditModal,
        closeModal,
        handleCreateShoe,
        handleUpdateShoe,
        handleSetDefault,
        handleRetire,
        refetch: fetchShoes,
    };
}
