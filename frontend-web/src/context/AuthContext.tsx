import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  username: string;
  role: 'Admin' | 'Operator' | 'Auditor';
  token: string;
  tenantId: string;
  tenantName: string;
}

interface AuthContextType {
  user: UserProfile;
  login: (username: string, role: 'Admin' | 'Operator' | 'Auditor') => Promise<void>;
  logout: () => void;
  switchRole: (role: 'Admin' | 'Operator' | 'Auditor') => void;
  switchTenant: (tenantId: string, tenantName: string) => void;
}

const defaultUser: UserProfile = {
  username: 'enterprise_admin',
  role: 'Admin',
  token: 'mock_jwt_bearer_token_admin_2026',
  tenantId: '10000000-0000-0000-0000-000000000001',
  tenantName: 'Nexus Global Enterprise'
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  login: async () => {},
  logout: () => {},
  switchRole: () => {},
  switchTenant: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    const savedToken = localStorage.getItem('nexus_jwt_token');
    const savedRole = localStorage.getItem('nexus_jwt_role') as 'Admin' | 'Operator' | 'Auditor';
    const savedUsername = localStorage.getItem('nexus_jwt_username');
    const savedTenantId = localStorage.getItem('nexus_tenant_id');
    const savedTenantName = localStorage.getItem('nexus_tenant_name');

    if (savedToken && savedRole && savedUsername) {
      setUser({
        username: savedUsername,
        role: savedRole,
        token: savedToken,
        tenantId: savedTenantId || defaultUser.tenantId,
        tenantName: savedTenantName || defaultUser.tenantName
      });
    }
  }, []);

  const login = async (username: string, role: 'Admin' | 'Operator' | 'Auditor') => {
    try {
      const res = await fetch('http://localhost:5050/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role })
      });
      if (res.ok) {
        const data = await res.json();
        const newUser: UserProfile = {
          username: data.username,
          role: data.role,
          token: data.accessToken,
          tenantId: user.tenantId,
          tenantName: user.tenantName
        };
        setUser(newUser);
        localStorage.setItem('nexus_jwt_token', data.accessToken);
        localStorage.setItem('nexus_jwt_role', data.role);
        localStorage.setItem('nexus_jwt_username', data.username);
        return;
      }
    } catch (e) {
      console.warn('Auth service fallback:', e);
    }

    const fallbackUser: UserProfile = {
      username: username || 'enterprise_admin',
      role,
      token: `bearer_token_${role.toLowerCase()}_${Date.now()}`,
      tenantId: user.tenantId,
      tenantName: user.tenantName
    };
    setUser(fallbackUser);
    localStorage.setItem('nexus_jwt_token', fallbackUser.token);
    localStorage.setItem('nexus_jwt_role', fallbackUser.role);
    localStorage.setItem('nexus_jwt_username', fallbackUser.username);
  };

  const logout = () => {
    setUser({ username: 'guest', role: 'Auditor', token: '', tenantId: defaultUser.tenantId, tenantName: defaultUser.tenantName });
    localStorage.removeItem('nexus_jwt_token');
    localStorage.removeItem('nexus_jwt_role');
    localStorage.removeItem('nexus_jwt_username');
  };

  const switchRole = (newRole: 'Admin' | 'Operator' | 'Auditor') => {
    login(user.username, newRole);
  };

  const switchTenant = (tenantId: string, tenantName: string) => {
    const updated = { ...user, tenantId, tenantName };
    setUser(updated);
    localStorage.setItem('nexus_tenant_id', tenantId);
    localStorage.setItem('nexus_tenant_name', tenantName);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, switchTenant }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
