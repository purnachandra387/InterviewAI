import axios from "axios";

const API = axios.create({
    baseURL: "https://interviewai-backend-0k7p.onrender.com/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/update-profile", data);
export const getUserProfile = () => API.get("/user/profile");
export const getUserBadges = () => API.get("/user/badges");

export const generateQuestionsAPI = (data) => API.post("/ai/generate", data);
export const getHistory = () => API.get("/ai/history");
export const getStats = () => API.get("/ai/stats");
export const deleteHistorySession = (id) => API.delete(`/ai/history/${id}`);
export const getCompanyPrep = (data) => API.post("/ai/company-prep", data);

export const mockStart = (data) => API.post("/mock/start", data);
export const mockEvaluate = (data) => API.post("/mock/evaluate", data);
export const mockSave = (data) => API.post("/mock/save", data);
export const getMockHistory = () => API.get("/mock/history");
export const getMockSessionById = (id) => API.get(`/mock/history/${id}`);

export const analyzeResume = (formData) =>
    API.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const getResumeHistory = () => API.get("/resume/history");
export const getResumeById = (id) => API.get(`/resume/history/${id}`);

export const createOrder = () => API.post("/payment/create-order");
export const verifyPayment = (data) => API.post("/payment/verify-payment", data);
export const demoUpgrade = () => API.post("/payment/demo-upgrade");

export const getAnalytics = () => API.get("/analytics");
export const getAdminOverview = () => API.get("/admin/overview");

export const getNotifications = () => API.get("/notifications");
export const markAllNotificationsRead = () => API.post("/notifications/mark-read");
export const markOneNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

export const getAchievements = () => API.get("/notifications/achievements");
export const getCoachTip = () => API.get("/notifications/coach-tip");
export const globalSearch = (q) => API.get(`/notifications/search?q=${encodeURIComponent(q)}`);

export const getJournalEntries = () => API.get("/journal");
export const createJournalEntry = (data) => API.post("/journal", data);
export const updateJournalEntry = (id, data) => API.put(`/journal/${id}`, data);
export const deleteJournalEntry = (id) => API.delete(`/journal/${id}`);

export const getMockSession = (id) => API.get(`/mock/history/${id}`);

export default API;
