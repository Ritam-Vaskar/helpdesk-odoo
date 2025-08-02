export const isAdmin = (user) => user?.role === "admin";
export const isAgent = (user) => user?.role === "agent";
export const isUser = (user) => user?.role === "user";
