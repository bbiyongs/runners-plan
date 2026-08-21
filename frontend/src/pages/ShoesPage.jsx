// src/pages/ShoesPage.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import ErrorState from '@/components/common/ErrorState';
import ShoeCard from '@/components/shoes/ShoeCard';
import ShoeModal from '@/components/shoes/ShoeModal';
import { useShoes } from '@/hooks/useShoes';
import '@/styles/ShoesPage.css';

export default function ShoesPage() {
    const {
        shoes,
        loading,
        error,
        isModalOpen,
        editingShoe,
        openCreateModal,
        openEditModal,
        closeModal,
        handleCreateShoe,
        handleUpdateShoe,
        handleSetDefault,
        handleRetire,
        refetch,
    } = useShoes();

    if (error) {
        return (
            <ErrorState
                title="러닝화 목록을 불러올 수 없습니다"
                message={error}
                onRetry={refetch}
            />
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                {/* 상단 헤더 */}
                <header className="shoes-header">
                    <div>
                        <h1 className="dashboard-title">러닝화 관리</h1>
                        <p className="dashboard-subtitle">
                            러닝화의 수명을 트래킹하여 관절 부상을 사전에 예방하세요.
                        </p>
                    </div>

                    <button className="add-shoe-btn" onClick={openCreateModal}>
                        <Plus size={18} /> 러닝화 등록
                    </button>
                </header>

                {/* 러닝화 카드 목록 */}
                {loading ? (
                    <div style={{ padding: '30px', color: '#64748b' }}>
                        러닝화 목록을 불러오는 중입니다...
                    </div>
                ) : shoes.length === 0 ? (
                    <div className="shoes-empty-card">
                        <p>등록된 러닝화가 없습니다. 새로운 러닝화를 등록해 보세요!</p>
                        <button className="add-shoe-btn" onClick={openCreateModal}>
                            <Plus size={18} /> 러닝화 등록하기
                        </button>
                    </div>
                ) : (
                    <div className="shoes-grid">
                        {shoes.map((shoe) => (
                            <ShoeCard
                                key={shoe.shoeId}
                                shoe={shoe}
                                onSetDefault={handleSetDefault}
                                onEdit={openEditModal}
                                onRetire={handleRetire}
                            />
                        ))}
                    </div>
                )}

                {/* 등록 및 수정 모달 */}
                <ShoeModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    editingShoe={editingShoe}
                    onSubmit={editingShoe ? handleUpdateShoe : handleCreateShoe}
                />
            </main>
        </div>
    );
}
