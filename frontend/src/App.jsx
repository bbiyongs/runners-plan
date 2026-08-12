import React from "react";
import { BrowserRouter, Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RunsPage from "./pages/RunsPage";
import MyPage from "./pages/MyPage";
import OAuth2CallbackPage from "./pages/OAuth2CallbackPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import StatsPage from "./pages/StatsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<LoginPage/>} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

        {/* 보호 라우트 (로그인) */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute>
                    <DashboardPage/>
                  </ProtectedRoute>}/>
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
          element={<ProtectedRoute><StatsPage/></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}