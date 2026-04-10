import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const ADMIN_TOKEN_KEY = "aksantimed_admin_token";

interface AdminAuthContextValue {
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  adminLogin: (token: string) => void;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));

  const adminLogin = useCallback((token: string) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setAdminToken(token);
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ adminToken, isAdminAuthenticated: !!adminToken, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
