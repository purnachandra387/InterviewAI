import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuestionGenerator from "./pages/QuestionGenerator";
import History from "./pages/History";
import MockInterview from "./pages/MockInterview";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Coach from "./pages/Coach";
import CompanyPrep from "./pages/CompanyPrep";
import Journal from "./pages/Journal";
import MockReview from "./pages/MockReview";
import Day13Interview from "./pages/Day13Interview";
import InterviewHistory from "./pages/InterviewHistory";
import Profile from "./pages/Profile";
import Roadmap from "./pages/Roadmap";
import DailyChallenge from "./pages/DailyChallenge";
import Progress from "./pages/Progress";
import PreparationTracker from "./pages/PreparationTracker";
import HRInterview from "./pages/HRInterview";
import AdminDashboard from "./pages/AdminDashboard";

const readStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        return {};
    }
};

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const user = readStoredUser();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return user.role === "admin"
        ? children
        : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/generate" element={<PrivateRoute><QuestionGenerator /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                <Route path="/mock" element={<PrivateRoute><MockInterview /></PrivateRoute>} />
                <Route path="/resume" element={<PrivateRoute><ResumeAnalyzer /></PrivateRoute>} />
                <Route path="/pricing" element={<PrivateRoute><Pricing /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                <Route path="/achievements" element={<PrivateRoute><Achievements /></PrivateRoute>} />
                <Route path="/coach" element={<PrivateRoute><Coach /></PrivateRoute>} />
                <Route path="/company" element={<PrivateRoute><CompanyPrep /></PrivateRoute>} />
                <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
                <Route path="/mock/review/:id" element={<PrivateRoute><MockReview /></PrivateRoute>} />
                <Route path="/day13" element={<PrivateRoute><Day13Interview /></PrivateRoute>} />
                <Route path="/interview-history" element={<PrivateRoute><InterviewHistory /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/roadmap" element={<PrivateRoute><Roadmap /></PrivateRoute>} />
                <Route path="/daily-challenge" element={<PrivateRoute><DailyChallenge /></PrivateRoute>} />
                <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
                <Route path="/tracker" element={<PrivateRoute><PreparationTracker /></PrivateRoute>} />
                <Route path="/hr-interview" element={<PrivateRoute><HRInterview /></PrivateRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
