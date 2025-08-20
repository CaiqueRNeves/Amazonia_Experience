import React from "react";
import "../styles/Auth.css";


export default function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🌿 Bem-vindo de volta!</h1>
        <p className="auth-subtitle">
          Acesse sua conta e explore experiências inesquecíveis na Amazônia.
        </p>

        <form className="auth-form">
          <input type="email" placeholder="E-mail" className="auth-input" />
          <input type="password" placeholder="Senha" className="auth-input" />
          <button type="submit" className="auth-button">
            Entrar
          </button>
        </form>

        <p className="auth-footer">
          Ainda não tem conta? <a href="/register">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}
