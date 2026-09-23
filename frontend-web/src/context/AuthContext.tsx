import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  username: string;
  role: 'Admin' | 'Operator' | 'Auditor';
  token: string;
}

interface AuthContextType {
  user: UserProfile;
  login: (username: string, role: 'Admin' | 'Operator' | 'Auditor') => Promise<void>;
  logout: () => void;
  switchRole: (role: 'Admin' | 'Operator' | 'Auditor') => void;
}

const defaultUser: UserProfile = {
  username: 'enterprise_admin',
  role: 'Admin',
  token: 'mock_jwt_bearer_token_admin_2026'
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  login: async () => {},
  logout: () => {},
  switchRole: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    const savedToken = localStorage.getItem('nexus_jwt_token');
    const savedRole = localStorage.getItem('nexus_jwt_role') as 'Admin' | 'Operator' | 'Auditor';
    const savedUsername = localStorage.getItem('nexus_jwt_username');

    if (savedToken && savedRole && savedUsername) {
      setUser({
        username: savedUsername,
        role: savedRole,
        token: savedToken
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
          token: data.accessToken
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

    // Fallback local JWT assignment
    const fallbackUser: UserProfile = {
      username: username || 'enterprise_admin',
      role,
      token: `bearer_token_${role.toLowerCase()}_${Date.now()}`
    };
    setUser(fallbackUser);
    localStorage.setItem('nexus_jwt_token', fallbackUser.token);
    localStorage.setItem('nexus_jwt_role', fallbackUser.role);
    localStorage.setItem('nexus_jwt_username', fallbackUser.username);
  };

  const logout = () => {
    setUser({ username: 'guest', role: 'Auditor', token: '' });
    localStorage.removeItem('nexus_jwt_token');
    localStorage.removeItem('nexus_jwt_role');
    localStorage.removeItem('nexus_jwt_username');
  };

  const switchRole = (newRole: 'Admin' | 'Operator' | 'Auditor') => {
    login(user.username, newRole);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
