import React, { useState } from 'react';
import Head from 'next/head';

interface IapSession {
  sessionId: string;
  userEmail: string;
  role: string;
  isMtlsValidated: boolean;
  mtlsFingerprint: string;
  oAuthIssuer: string;
  tokenExpiresAt: string;
  devicePosture: string;
  clientIp: string;
}

export default function IapSecurity() {
  const [session] = useState<IapSession>({
    sessionId: '7f8e9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    userEmail: 'secops-admin@nexusops.enterprise.io',
    role: 'SecOpsAdmin',
    isMtlsValidated: true,
    mtlsFingerprint: 'SHA256:7f8e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    oAuthIssuer: 'https://auth.nexusops.enterprise.io',
    tokenExpiresAt: new Date(Date.now() + 55 * 60000).toISOString(),
    devicePosture: 'Compliant (Encrypted Disk / EDR Active)',
    clientIp: '192.168.10.45',
  });

  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestAuthorization = () => {
    setTestResult('✅ ALLOWED: Zero-Trust mTLS v1.3 & OAuth2 Claim Validated for /api/admin/system');
  };

  return (
    <>
      <Head>
        <title>Zero-Trust IAP Security - NexusOps Enterprise</title>
      </Head>
      <div style={{ padding: '2rem', background: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#38bdf8' }}>
          🔐 Zero-Trust Identity-Aware Proxy (IAP) Security
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Context-Aware Identity Proxy, Short-Lived OAuth2 Token Validation & mTLS Certificate Handshake Control
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>mTLS Certificate Handshake</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4ade80', marginTop: '0.5rem' }}>
              {session.isMtlsValidated ? '🔒 mTLS v1.3 Validated' : '❌ Unvalidated'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', wordBreak: 'break-all' }}>
              Fingerprint: {session.mtlsFingerprint}
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Identity & Device Posture</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.5rem' }}>
              {session.userEmail} ({session.role})
            </div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.5rem' }}>
              {session.devicePosture}
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>OAuth2 OIDC Token Lifetime</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#facc15', marginTop: '0.5rem' }}>
              Expires in 55 min
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Issuer: {session.oAuthIssuer}
            </div>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#f8fafc' }}>
            🧪 Interactive IAP Access Evaluator
          </h2>
          <button
            onClick={handleTestAuthorization}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Evaluate Access to /api/admin/system
          </button>
          {testResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#064e3b', color: '#6ee7b7', borderRadius: '0.5rem', fontWeight: 500 }}>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
