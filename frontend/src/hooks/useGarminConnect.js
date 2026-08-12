import { useState, useEffect, useCallback } from "react";
import { garminApi } from "../api/garminApi";

export function useGarminConnect (isOpen, runnerId, onSyncSuccess) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncingInitial, setSyncingInitial] = useState(false);
    const [statusInfo, setStatusInfo] = useState({
        is_connected: false,
        garmin_email: '',
        initial_sync_completed: false,
        last_synced_at: null,
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // 가민 연동 상태 조회
    const fetchGarminStatus = useCallback(async() => {
        if (!runnerId) return;
        try{
            setErrorMessage('');
            const data = await garminApi.getStatus(runnerId);
            setStatusInfo(data);
            if (data.garmin_email) {
                setEmail(data.garmin_email)
            } else {
                setEmail('');
            };
        } catch(err){
            console.error('Garmin 상태 조회 실패 : ', err);
            setStatusInfo({
                is_connected: false,
                garmin_email:'',
                initial_sync_completed: false,
                last_synced_at: null,
            });
            setEmail('');
        }
    }, [runnerId]);

    useEffect(()=> {
        if(isOpen) {
            setEmail('');
            setPassword('');
            fetchGarminStatus();
            setErrorMessage('');
            setSuccessMessage('');
        }
    }, [isOpen, runnerId, fetchGarminStatus]);

    // 계정연동 제출
    const handleConnectSubmit = async(e) => {
        e.preventDefault();
        if (!email || !password) {
            setErrorMessage('가민 이메일, 비밀번호 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const res = await garminApi.connectAccount(runnerId, email, password);
            setSuccessMessage(res.message || 'garmin 연동 성공');
            setPassword('');
            await fetchGarminStatus();
            if (onSyncSuccess) onSyncSuccess();
        } catch(err){
            const detail = err.response?.data?.detail || 'garmin 연동실패 , 아이디/비밀번호를 확인하세요.';
            setErrorMessage(detail);
        } finally {
            setLoading(false);
        }
    };

    // 과거 기록 전체 동기화
    const handleInitialSync = async() => {
        setSyncingInitial(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const res = await garminApi.syncInitialHistory(runnerId);
            setSuccessMessage(res.message || '초기 과거 기록 전체 동기화 완료');
            await fetchGarminStatus();
            if (onSyncSuccess) onSyncSuccess();
        } catch (err) {
            const detail = err.response?.data?.detail || '전체 동기화 도중 오류 발생';
            setErrorMessage(detail);
        } finally {
            setSyncingInitial(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        syncingInitial,
        statusInfo,
        errorMessage,
        successMessage,
        handleConnectSubmit,
        handleInitialSync,
    };
}