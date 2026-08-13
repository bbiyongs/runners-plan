import React from "react";
import { BrowserRouter, Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RunsPage from "./pages/RunsPage";
import MyPage from "./pages/MyPage";
import OAuth2CallbackPage from "./pages/OAuth2CallbackPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import StatsPage from "./pages/StatsPage";
import ErrorState from "./components/common/ErrorState";

export default function App() {
  return (
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
          element={<ProtectedRoute><MyPage /></ProtectedRoute>}
        />
        <Route
          path="/stats"
          element={<ProtectedRoute><StatsPage /></ProtectedRoute>}
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
  );
}