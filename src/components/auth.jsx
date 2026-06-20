import { useState } from "react";
import { Eye, EyeOff } from "./icons.jsx";

export function AuthInput({ label, type = "text", value, onChange, placeholder, hint, autoComplete, inputMode }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="input"
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          style={isPassword ? { paddingRight: 46 } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-mute)", display: "grid", placeItems: "center", padding: 4,
            }}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

export function AuthDivider({ lang }) {
  return (
    <div className="divider">
      <span>{lang === "it" ? "oppure" : "or"}</span>
    </div>
  );
}

export function GoogleBtn({ lang, onClick }) {
  return (
    <button onClick={onClick} className="btn btn-ghost btn-block" style={{ padding: 13 }}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.8 0 6.9 5.4 2.9 13.3l7.8 6C12.5 13 17.8 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z" />
        <path fill="#FBBC05" d="M10.7 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.2-6z" />
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.3-9.9l-8.2 6C6.9 42.6 14.8 48 24 48z" />
      </svg>
      {lang === "it" ? "Continua con Google" : "Continue with Google"}
    </button>
  );
}

export function ErrorBanner({ children }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderRadius: 10, marginBottom: 16,
        background: "var(--redDim, #FBE0E8)", border: "1px solid rgba(226,58,99,0.35)",
        fontSize: 13, color: "var(--red)", fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}
