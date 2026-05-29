import React, { useState, useEffect } from 'react';
import { toast } from '../components/Toast';
import adminAPI from '../utils/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStates, setEditStates] = useState({});
  const [revealStates, setRevealStates] = useState({});

  useEffect(() => {
    adminAPI.getSettings()
      .then(data => {
        setSettings(data);
        setFormValues(data);
        setLoading(false);
      })
      .catch(err => {
        toast.error(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (key, val) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFormValues(settings);
    setEditStates({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await adminAPI.updateSettings(formValues);
      setSettings(formValues);
      setEditStates({});
      toast.success(response.message || 'Settings updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(formValues).some(key => formValues[key] !== settings[key]);

  const toggleReveal = (key) => {
    setRevealStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEdit = (key) => {
    setEditStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getMaskedValue = (val) => {
    if (!val) return 'not set';
    if (val.length <= 8) return '••••••••';
    return `${val.slice(0, 4)}••••••••••••••••••••••••${val.slice(-4)}`;
  };

  const isMpesaActive = formValues.MPESA_CONSUMER_KEY && formValues.MPESA_CONSUMER_SECRET && formValues.MPESA_SHORTCODE;
  const isSmsActive = formValues.AFRICASTALKING_SMS_USERNAME && formValues.AFRICASTALKING_SMS_API_KEY;

  if (loading) {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease', padding: '24px' }}>
        <div className="skeleton" style={{ height: 40, width: '200px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: 200, width: '100%', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: 200, width: '100%' }} />
      </div>
    );
  }

  const sectionStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: 'var(--shadow)',
  };

  const sectionHeaderStyle = {
    borderBottom: '1px solid var(--border)',
    paddingBottom: '12px',
    marginBottom: '16px',
  };

  const titleStyle = {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const subStyle = {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  };

  const labelStyle = {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const detailGroupStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    padding: '12px 0',
  };

  const badgeStyle = (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '99px',
    background: active ? 'var(--success-bg)' : 'var(--failed-bg)',
    color: active ? 'var(--success)' : 'var(--accent-danger)',
    border: active ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
  });

  const renderField = (label, envKey, isSelect = false, selectOptions = []) => {
    const isEditing = editStates[envKey];
    const isRevealed = revealStates[envKey];
    const val = settings[envKey] || '';
    const tempVal = formValues[envKey] || '';

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 0',
        borderBottom: '1px solid var(--border)',
      }} key={envKey}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{envKey}</span>
            {val && (
              <button
                type="button"
                onClick={() => toggleReveal(envKey)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: 0,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                {isRevealed ? 'Hide' : 'Reveal'}
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleEdit(envKey)}
              style={{
                background: 'none',
                border: 'none',
                color: isEditing ? 'var(--accent-danger)' : 'var(--accent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: 0,
                cursor: 'pointer',
              }}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        <div>
          {isEditing ? (
            isSelect ? (
              <select
                value={tempVal}
                onChange={e => handleChange(envKey, e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                {selectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : (
              <input
                type={isRevealed ? 'text' : 'password'}
                value={tempVal}
                onChange={e => handleChange(envKey, e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
                autoFocus
              />
            )
          ) : (
            <span style={{
              fontSize: '0.88rem',
              color: val ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}>
              {isRevealed ? val : getMaskedValue(val)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Settings</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Manage your workspace credentials and integration settings.
        </p>
      </div>

      {/* Account Info */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={titleStyle}>Account</div>
          <div style={subStyle}>Active administrator profile workspace details.</div>
        </div>
        <div style={detailGroupStyle}>
          <div>
            <div style={labelStyle}>Email</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{settings.ADMIN_USERNAME || 'admin@trustfundcapital.co.ke'}</div>
          </div>
          <div>
            <div style={labelStyle}>Role</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Administrator</div>
          </div>
          <div>
            <div style={labelStyle}>Workspace</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{settings.MPESA_PARTNER_NAME || 'TrustFund Capital'}</div>
          </div>
          <div>
            <div style={labelStyle}>Currency</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>KES (Kenyan Shilling)</div>
          </div>
        </div>
      </div>

      {/* M-Pesa Integration */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={titleStyle}>
            <span>M-Pesa Integration</span>
            <span style={badgeStyle(isMpesaActive)}>{isMpesaActive ? '● Configured' : '● Not configured'}</span>
          </div>
          <div style={subStyle}>
            Safaricom Daraja — Till/Paybill integration. Customers pay directly and transactions are recorded automatically.
          </div>
        </div>
        {renderField('Environment', 'MPESA_ENV', true, [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'production', label: 'Production (Live)' }
        ])}
        {renderField('Consumer Key', 'MPESA_CONSUMER_KEY')}
        {renderField('Consumer Secret', 'MPESA_CONSUMER_SECRET')}
        {renderField('Shortcode', 'MPESA_SHORTCODE')}
        {renderField('Passkey', 'MPESA_PASSKEY')}
        {renderField('Callback URL', 'MPESA_CALLBACK_URL')}
      </div>

      {/* SMS Provider (Africa's Talking) */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={titleStyle}>
            <span>SMS Provider (Africa's Talking)</span>
            <span style={badgeStyle(isSmsActive)}>{isSmsActive ? '● Configured' : '● Key missing'}</span>
          </div>
          <div style={subStyle}>
            Africa's Talking Media — SMS alerts sent to applicants after loan status changes and approvals.
          </div>
        </div>
        {renderField('Environment', 'AFRICASTALKING_SMS_ENV', true, [
          { value: 'sandbox', label: 'Sandbox (Testing)' },
          { value: 'production', label: 'Production (Live)' }
        ])}
        {renderField('Username', 'AFRICASTALKING_SMS_USERNAME')}
        {renderField('API Key', 'AFRICASTALKING_SMS_API_KEY')}
        {renderField('Sender ID', 'AFRICASTALKING_SMS_SENDER_ID')}
      </div>

      {/* Database & Infrastructure */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={titleStyle}>Database & Infrastructure</div>
          <div style={subStyle}>
            Database connectivity details and critical system access tokens. Modify with caution.
          </div>
        </div>
        {renderField('Database URL', 'DATABASE_URL')}
        {renderField('Database Path', 'DATABASE_PATH')}
        {renderField('Admin Token', 'ADMIN_TOKEN')}
        {renderField('Admin Username', 'ADMIN_USERNAME')}
        {renderField('Admin Password', 'ADMIN_PASSWORD')}
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out',
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>You have unsaved changes</span>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, var(--accent), #4f46e5)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px var(--accent-glow)',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
