import React, {lazy, Suspense} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@components/layout/ProtectedRoute";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const RunsPage = lazy(()=> import('@/pages/RunsPage'));
const MyPage = lazy(() => import('@/pages/MyPage'));
const OAuth2CallbackPage = lazy(()=> import('@/pages/OAuth2CallbackPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const ShoesPage = lazy(() => import('@/pages/ShoesPage'));
const ErrorState = lazy(()=> import('@/components/common/ErrorState'));

export default function App() {
  const { logout } = useAuth();
  useEffect(() => {
    const handler = () => { logout(); };
    window.addEventListener('auth:expired', handler);
    return() => window.removeEventListener('auth:expired', handler);
  }, [logout]);

  return (
    <Suspense fallback={<div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}> 로딩 중 ... </div>}>
      <BrowserRouter>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

          {/* 보호 라우트 (로그인) */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>} />
          <Route
            path="/runs"
            element={<ProtectedRoute>
              <RunsPage />
            </ProtectedRoute>} />
          <Route
            path="/profile"
            element={<ProtectedRoute><MyPage /></ProtectedRoute>}
          />
          <Route
            path="/mypage"
            element={<Navigate to="/profile" replace />}
          />
          <Route
            path="/stats"
            element={<ProtectedRoute><StatsPage /></ProtectedRoute>}
          />
          <Route
            path="/shoes"
            element={<ProtectedRoute><ShoesPage /></ProtectedRoute>}
          />
          {/* 💡 [신규] 404 Not Found 예외 공통 라우트 */}
          <Route
            path="*"
            element={
              <ErrorState
                title="페이지를 찾을 수 없습니다 (404)"
                message="입력하신 웹 주소가 올바르지 않거나 삭제된 페이지입니다."
                redirectUrl="/dashboard"
                redirectText="🏠 대시보드로 이동"
                showSidebar={true}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}