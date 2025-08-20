import React from "react";
import "../styles/Auth.css";


export default function Register() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🌱 Crie sua conta</h1>
        <p className="auth-subtitle">
          Junte-se a nós e descubra os encantos da Amazônia Paraense.
        </p>

        <form className="auth-form">
          <input type="text" placeholder="Nome completo" className="auth-input" />
          <input type="email" placeholder="E-mail" className="auth-input" />
          <input type="password" placeholder="Senha" className="auth-input" />
          <button type="submit" className="auth-button">
            Cadastrar
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <a href="/login">Faça login</a>
        </p>
      </div>
    </div>
  );
}
