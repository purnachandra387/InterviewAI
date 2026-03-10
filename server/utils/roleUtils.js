const ADMIN_ROLE = "admin";
const USER_ROLE = "user";

const getConfiguredAdminEmails = () =>
    (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

const isConfiguredAdminEmail = (email = "") =>
    getConfiguredAdminEmails().includes(email.trim().toLowerCase());

const getRoleForEmail = (email = "") =>
    isConfiguredAdminEmail(email) ? ADMIN_ROLE : USER_ROLE;

const syncUserRoleFromConfig = async (user) => {
    if (!user) return user;

    if (isConfiguredAdminEmail(user.email) && user.role !== ADMIN_ROLE) {
        user.role = ADMIN_ROLE;
        await user.save();
    }

    return user;
};

module.exports = {
    ADMIN_ROLE,
    USER_ROLE,
    getRoleForEmail,
    syncUserRoleFromConfig,
};
