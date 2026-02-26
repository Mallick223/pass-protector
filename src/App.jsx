import { useState, useEffect } from "react";
import PasswordStrengthAnalyzer from './password-strength-analyzer';
import './password-strength-analyzer.css';
import { encryptPassword, decryptPassword, encryptPasswordEntry, generateSecurePassword } from './encryptionService';
import { simulateBreachDetection, isProperEmail } from './breachDetectionService';
import { handleGoogleSignInSuccess, handleGoogleSignInError } from './googleAuthService';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=DM+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --lime: #C8FF00;
    --coral: #FF5C5C;
    --sky: #38CFFF;
    --violet: #7B5EFF;
    --orange: #FF9A3C;
    --dark: #0F0F14;
    --card: #1A1A24;
    --border: #2E2E40;
    --text: #F0F0FF;
    --muted: #8888AA;
  }

  html, body, #root { height: 100%; width: 100%; overflow-x: hidden; }

  body {
    background: var(--dark);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .noise-wrap { min-height: 100vh; width: 100%; position: relative; }
  .noise-wrap::after {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 9999; opacity: 0.35;
  }

  /* LOADER */
  .loader-wrap {
    position: fixed; inset: 0; background: var(--dark);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 1000; gap: 24px;
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .loader-wrap.fade-out { opacity: 0; transform: scale(1.04); pointer-events: none; }
  .logo-mark { position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; }
  .logo-ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid transparent; animation: spin 1.4s linear infinite; }
  .logo-ring:nth-child(1) { border-top-color: var(--lime); border-right-color: var(--lime); animation-duration: 1.2s; }
  .logo-ring:nth-child(2) { inset: 10px; border-bottom-color: var(--coral); border-left-color: var(--coral); animation-direction: reverse; animation-duration: 1.8s; }
  .logo-ring:nth-child(3) { inset: 22px; border-top-color: var(--sky); animation-duration: 2.2s; }
  .logo-inner {
    position: relative; z-index: 2; width: 52px; height: 52px;
    background: linear-gradient(135deg, var(--violet), var(--coral));
    border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px;
    animation: pulse-glow 1.5s ease-in-out infinite alternate;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-glow {
    from { box-shadow: 0 0 20px rgba(123,94,255,0.4); transform: scale(1); }
    to   { box-shadow: 0 0 40px rgba(255,92,92,0.6); transform: scale(1.06); }
  }
  .loader-brand {
    font-family: 'Fredoka One', cursive; font-size: clamp(1.8rem, 5vw, 2.4rem);
    background: linear-gradient(90deg, var(--lime), var(--sky), var(--coral));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .loader-dots { display: flex; gap: 8px; }
  .loader-dots span { width: 8px; height: 8px; border-radius: 50%; animation: bounce 1s ease infinite; }
  .loader-dots span:nth-child(1) { background: var(--lime); }
  .loader-dots span:nth-child(2) { background: var(--coral); animation-delay: 0.15s; }
  .loader-dots span:nth-child(3) { background: var(--sky); animation-delay: 0.3s; }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} }

  /* APP SHELL */
  .app { min-height: 100vh; display: flex; flex-direction: column; width: 100%; }

  /* NAV */
  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px clamp(16px, 4vw, 40px);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(16px);
    background: rgba(15,15,20,0.88);
    position: sticky; top: 0; z-index: 200; width: 100%;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Fredoka One', cursive; font-size: clamp(1.1rem, 3vw, 1.5rem);
    background: linear-gradient(90deg, var(--lime), var(--sky));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    cursor: pointer; flex-shrink: 0;
  }
  .nav-logo-icon {
    width: clamp(30px, 5vw, 36px); height: clamp(30px, 5vw, 36px);
    background: linear-gradient(135deg, var(--violet), var(--coral));
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: clamp(14px, 2.5vw, 18px); flex-shrink: 0;
  }
  .nav-links { display: flex; gap: 10px; align-items: center; }

  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 6px; background: none; border: none; }
  .hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: all 0.3s ease; }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .mobile-menu {
    display: none; position: fixed; inset: 0;
    background: rgba(15,15,20,0.98); z-index: 199;
    flex-direction: column; align-items: center; justify-content: center; gap: 16px;
    animation: fade-up 0.25s ease;
  }
  .mobile-menu.open { display: flex; }
  .mobile-menu .btn { width: 220px; text-align: center; padding: 14px; font-size: 1rem; }

  /* BUTTONS */
  .btn {
    padding: 9px 20px; border-radius: 12px; font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 0.88rem; cursor: pointer; border: none;
    transition: all 0.2s ease; white-space: nowrap;
  }
  .btn-ghost { background: transparent; color: var(--muted); border: 1.5px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--violet); }
  .btn-primary { background: linear-gradient(135deg, var(--lime), #90FF00); color: #0F0F14; font-weight: 700; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,255,0,0.3); }
  .btn-coral { background: linear-gradient(135deg, var(--coral), var(--orange)); color: white; font-weight: 700; }
  .btn-coral:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,92,92,0.35); }
  .btn-violet { background: linear-gradient(135deg, var(--violet), #5A3ECC); color: white; font-weight: 700; }
  .btn-violet:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(123,94,255,0.4); }
  .btn-full { width: 100%; padding: 14px; font-size: 1rem; border-radius: 14px; }

  /* HOME */
  .home { flex: 1; display: flex; flex-direction: column; }

  .hero {
    padding: clamp(50px, 10vw, 100px) clamp(16px, 5vw, 60px) clamp(40px, 7vw, 70px);
    text-align: center; position: relative; overflow: hidden;
  }
  .hero-blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.15; pointer-events: none; }
  .hero-blob-1 { width: clamp(200px,40vw,500px); height: clamp(200px,40vw,500px); background: var(--violet); top:-20%; left:-10%; }
  .hero-blob-2 { width: clamp(180px,35vw,400px); height: clamp(180px,35vw,400px); background: var(--coral); top:0; right:-8%; }
  .hero-blob-3 { width: clamp(150px,30vw,350px); height: clamp(150px,30vw,350px); background: var(--lime); bottom:-8%; left:40%; }

  .hero-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(200,255,0,0.1); border: 1.5px solid rgba(200,255,0,0.3);
    color: var(--lime); border-radius: 99px;
    padding: 5px 14px; font-size: clamp(0.72rem,2vw,0.82rem); font-weight: 600; margin-bottom: 20px;
    animation: fade-up 0.5s ease both;
  }
  .hero h1 {
    font-family: 'Fredoka One', cursive; font-size: clamp(2.2rem, 7vw, 5rem); line-height: 1.1;
    margin-bottom: 18px; animation: fade-up 0.6s ease both 0.1s;
  }
  .accent-lime { color: var(--lime); }
  .accent-coral { color: var(--coral); }
  .hero-sub {
    font-size: clamp(0.95rem, 2.5vw, 1.1rem); color: var(--muted);
    max-width: 540px; margin: 0 auto 32px; line-height: 1.7;
    animation: fade-up 0.6s ease both 0.2s;
  }
  .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; animation: fade-up 0.6s ease both 0.3s; }
  .hero-cta .btn { padding: clamp(10px,2vw,13px) clamp(20px,4vw,32px); font-size: clamp(0.9rem,2vw,1rem); }

  @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }

  .stats {
    display: flex; justify-content: center; flex-wrap: wrap;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    margin: 0 clamp(16px, 4vw, 40px);
  }
  .stat {
    flex: 1; min-width: 120px; padding: clamp(20px,3vw,32px) clamp(12px,2vw,24px);
    text-align: center; border-right: 1px solid var(--border);
    animation: fade-up 0.6s ease both;
  }
  .stat:last-child { border-right: none; }
  .stat-num {
    font-family: 'Fredoka One', cursive; font-size: clamp(1.6rem,4vw,2.4rem);
    background: linear-gradient(135deg, var(--sky), var(--violet));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .stat-label { font-size: clamp(0.75rem,1.8vw,0.85rem); color: var(--muted); margin-top: 4px; }

  .features { padding: clamp(40px,7vw,80px) clamp(16px,5vw,40px); }
  .section-title { font-family: 'Fredoka One', cursive; font-size: clamp(1.4rem,4vw,2rem); margin-bottom: 32px; text-align: center; }
  .feature-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: clamp(12px,2vw,20px); max-width: 1000px; margin: 0 auto;
  }
  .feature-card {
    background: var(--card); border: 1.5px solid var(--border);
    border-radius: 20px; padding: clamp(20px,3vw,28px);
    transition: all 0.25s ease; position: relative; overflow: hidden;
  }
  .feature-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; }
  .feature-card:hover { transform: translateY(-4px); border-color: transparent; }
  .feature-card:hover::before { opacity: 1; }
  .fc-lime::before { background: linear-gradient(135deg,rgba(200,255,0,0.08),transparent); border:1.5px solid rgba(200,255,0,0.4); border-radius:20px; }
  .fc-coral::before { background: linear-gradient(135deg,rgba(255,92,92,0.08),transparent); border:1.5px solid rgba(255,92,92,0.4); border-radius:20px; }
  .fc-sky::before { background: linear-gradient(135deg,rgba(56,207,255,0.08),transparent); border:1.5px solid rgba(56,207,255,0.4); border-radius:20px; }
  .fc-violet::before { background: linear-gradient(135deg,rgba(123,94,255,0.08),transparent); border:1.5px solid rgba(123,94,255,0.4); border-radius:20px; }
  .feature-icon {
    width: clamp(40px,6vw,48px); height: clamp(40px,6vw,48px); border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(18px,3vw,22px); margin-bottom: 14px;
  }
  .fi-lime{background:rgba(200,255,0,0.15)} .fi-coral{background:rgba(255,92,92,0.15)}
  .fi-sky{background:rgba(56,207,255,0.15)} .fi-violet{background:rgba(123,94,255,0.15)}
  .feature-card h3 { font-size: clamp(0.9rem,2vw,1rem); font-weight: 700; margin-bottom: 8px; }
  .feature-card p { font-size: clamp(0.82rem,1.8vw,0.88rem); color: var(--muted); line-height: 1.6; }

  .footer {
    padding: clamp(16px,3vw,22px) clamp(16px,4vw,40px);
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  }
  .footer-left { font-family:'Fredoka One',cursive; font-size:clamp(0.95rem,2vw,1.1rem); color:var(--muted); }
  .footer-right { font-size:clamp(0.75rem,1.6vw,0.82rem); color:var(--muted); }

  /* AUTH */
  .auth-wrap {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: clamp(24px,5vw,60px) clamp(16px,4vw,24px);
    position: relative; overflow: hidden; min-height: calc(100vh - 65px);
  }
  .auth-blob { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.12; pointer-events:none; }
  .auth-blob-1 { width:clamp(200px,40vw,400px); height:clamp(200px,40vw,400px); background:var(--violet); top:-15%; right:-8%; }
  .auth-blob-2 { width:clamp(150px,30vw,300px); height:clamp(150px,30vw,300px); background:var(--lime); bottom:-8%; left:-6%; }

  .auth-card {
    background: var(--card); border: 1.5px solid var(--border);
    border-radius: clamp(20px,4vw,28px);
    padding: clamp(28px,5vw,44px) clamp(20px,5vw,40px);
    width: 100%; max-width: 420px;
    position: relative; z-index: 1;
    animation: fade-up 0.5s ease both;
    box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  }
  .auth-logo { display:flex; align-items:center; gap:10px; margin-bottom:clamp(22px,4vw,32px); justify-content:center; }
  .auth-logo-icon {
    width:clamp(36px,6vw,44px); height:clamp(36px,6vw,44px);
    background:linear-gradient(135deg,var(--violet),var(--coral));
    border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:clamp(18px,3vw,22px);
  }
  .auth-logo-text {
    font-family:'Fredoka One',cursive; font-size:clamp(1.3rem,3vw,1.6rem);
    background:linear-gradient(90deg,var(--lime),var(--sky));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .auth-card h2 { font-family:'Fredoka One',cursive; font-size:clamp(1.5rem,4vw,1.8rem); margin-bottom:6px; text-align:center; }
  .auth-sub { text-align:center; color:var(--muted); font-size:clamp(0.82rem,2vw,0.9rem); margin-bottom:24px; }

  .form-group { margin-bottom: 16px; }
  .form-label { display:block; font-size:clamp(0.8rem,2vw,0.85rem); font-weight:600; margin-bottom:7px; }
  .form-input {
    width:100%; padding:clamp(11px,2vw,13px) 16px; border-radius:12px;
    background:rgba(255,255,255,0.04); border:1.5px solid var(--border);
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:clamp(0.9rem,2vw,0.95rem);
    transition:border-color 0.2s,box-shadow 0.2s; outline:none; -webkit-appearance:none;
  }
  .form-input:focus { border-color:var(--violet); box-shadow:0 0 0 3px rgba(123,94,255,0.15); }
  .form-input::placeholder { color:var(--muted); }

  .input-wrap { position:relative; }
  .input-wrap .form-input { padding-right:46px; }
  .input-eye {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    cursor:pointer; color:var(--muted); background:none; border:none;
    padding:4px; min-width:32px; min-height:32px;
    display:flex; align-items:center; justify-content:center; font-size:16px; transition:color 0.2s;
  }
  .input-eye:hover { color:var(--text); }

  .strength-bar { height:4px; border-radius:4px; margin-top:8px; background:var(--border); overflow:hidden; }
  .strength-fill { height:100%; border-radius:4px; transition:width 0.4s,background 0.4s; }
  .strength-label { font-size:0.75rem; color:var(--muted); margin-top:4px; }

  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  .divider { display:flex; align-items:center; gap:12px; margin:20px 0; color:var(--muted); font-size:0.82rem; }
  .divider::before,.divider::after { content:''; flex:1; height:1px; background:var(--border); }

  .social-btns { display:flex; gap:10px; }
  .btn-social {
    flex:1; padding:clamp(10px,2vw,12px); border-radius:12px;
    background:rgba(255,255,255,0.04); border:1.5px solid var(--border);
    color:var(--text); cursor:pointer; font-size:clamp(0.82rem,2vw,0.92rem);
    transition:all 0.2s; font-family:'DM Sans',sans-serif; font-weight:600;
  }
  .btn-social:hover { border-color:var(--violet); background:rgba(123,94,255,0.1); }

  .auth-switch { text-align:center; margin-top:20px; font-size:clamp(0.82rem,2vw,0.88rem); color:var(--muted); }
  .auth-switch a { color:var(--lime); font-weight:600; cursor:pointer; }
  .auth-switch a:hover { text-decoration:underline; }

  .checkbox-wrap { display:flex; align-items:flex-start; gap:10px; margin-bottom:18px; }
  .checkbox-wrap input { width:17px; height:17px; accent-color:var(--violet); flex-shrink:0; margin-top:2px; cursor:pointer; }
  .checkbox-wrap label { font-size:clamp(0.8rem,2vw,0.85rem); color:var(--muted); cursor:pointer; line-height:1.5; }
  .checkbox-wrap a { color:var(--sky); }

  /* DASHBOARD */
  .dashboard { flex:1; padding:clamp(20px,4vw,40px) clamp(16px,4vw,40px); max-width:1100px; margin:0 auto; width:100%; }
  .dash-header { margin-bottom:clamp(24px,4vw,36px); animation:fade-up 0.5s ease both; }
  .dash-header h1 { font-family:'Fredoka One',cursive; font-size:clamp(1.5rem,4vw,2rem); }
  .dash-header h1 span { color:var(--lime); }
  .dash-header p { color:var(--muted); margin-top:4px; font-size:clamp(0.85rem,2vw,0.95rem); }

  .dash-grid {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));
    gap:clamp(10px,2vw,16px); margin-bottom:clamp(24px,4vw,32px);
  }
  .dash-stat-card {
    background:var(--card); border:1.5px solid var(--border);
    border-radius:20px; padding:clamp(18px,3vw,24px);
    animation:fade-up 0.5s ease both; position:relative; overflow:hidden;
  }
  .dash-stat-card::after { content:attr(data-emoji); position:absolute; right:14px; top:14px; font-size:clamp(1.4rem,3vw,2rem); opacity:0.15; }
  .dash-stat-num { font-family:'Fredoka One',cursive; font-size:clamp(1.7rem,4vw,2.2rem); margin-bottom:4px; }
  .dash-stat-label { font-size:clamp(0.75rem,1.8vw,0.85rem); color:var(--muted); }

  .dash-recent { animation:fade-up 0.5s ease both 0.2s; }
  .dash-recent h2 { font-family:'Fredoka One',cursive; font-size:clamp(1.1rem,3vw,1.3rem); margin-bottom:14px; }

  .pass-list { display:flex; flex-direction:column; gap:10px; }
  .pass-item {
    background:var(--card); border:1.5px solid var(--border);
    border-radius:16px; padding:clamp(12px,2vw,16px) clamp(14px,3vw,20px);
    display:flex; align-items:center; gap:clamp(10px,2vw,16px);
    transition:all 0.2s; cursor:pointer;
  }
  .pass-item:hover { border-color:var(--violet); background:rgba(123,94,255,0.05); transform:translateX(4px); }
  .pass-avatar {
    width:clamp(36px,5vw,42px); height:clamp(36px,5vw,42px); border-radius:12px;
    display:flex; align-items:center; justify-content:center; font-size:clamp(16px,3vw,20px); flex-shrink:0;
  }
  .pass-info { flex:1; min-width:0; }
  .pass-name { font-weight:700; font-size:clamp(0.88rem,2vw,0.95rem); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pass-user { font-size:clamp(0.72rem,1.6vw,0.82rem); color:var(--muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pass-strength { font-size:clamp(0.68rem,1.5vw,0.75rem); font-weight:700; padding:3px 10px; border-radius:99px; flex-shrink:0; }
  .ps-strong{background:rgba(200,255,0,0.15);color:var(--lime)}
  .ps-medium{background:rgba(255,154,60,0.15);color:var(--orange)}
  .ps-weak{background:rgba(255,92,92,0.15);color:var(--coral)}
  .pass-copy {
    width:clamp(30px,4vw,34px); height:clamp(30px,4vw,34px); border-radius:10px;
    background:rgba(255,255,255,0.04); border:1.5px solid var(--border);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:14px; transition:all 0.2s; color:var(--muted); flex-shrink:0;
  }
  .pass-copy:hover { border-color:var(--lime); color:var(--lime); }
  
  .pass-view {
    width:clamp(30px,4vw,34px); height:clamp(30px,4vw,34px); border-radius:10px;
    background:rgba(56,207,255,0.08); border:1.5px solid rgba(56,207,255,0.3);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:14px; transition:all 0.2s; color:var(--sky); flex-shrink:0; margin-right:8px;
  }
  .pass-view:hover { border-color:var(--sky); background:rgba(56,207,255,0.15); box-shadow:0 0 12px rgba(56,207,255,0.2); }
  
  .pass-decrypted { animation:fade-up 0.3s ease both; }

  /* Breach Alert Banner */
  .breach-alert-banner {
    background:linear-gradient(135deg,rgba(255,92,92,0.15),rgba(255,154,60,0.1));
    border:2px solid var(--coral);
    border-radius:16px;
    padding:clamp(16px,3vw,24px);
    margin-bottom:24px;
    animation:slide-down 0.4s ease both;
  }
  .breach-alert-content {
    display:flex;
    gap:clamp(12px,2vw,20px);
    align-items:flex-start;
  }
  .breach-alert-icon {
    font-size:clamp(24px,5vw,32px);
    flex-shrink:0;
    animation:pulse 2s infinite;
  }
  .breach-alert-text {
    flex:1;
  }
  .breach-alert-text strong {
    color:var(--coral);
    display:block;
    font-size:clamp(0.95rem,2.2vw,1.1rem);
    margin-bottom:4px;
  }
  .breach-alert-text p {
    color:var(--muted);
    font-size:clamp(0.85rem,2vw,0.95rem);
    margin:0;
  }
  .breach-alert-close {
    background:rgba(255,92,92,0.1);
    border:none;
    color:var(--coral);
    cursor:pointer;
    width:32px; height:32px;
    border-radius:8px;
    font-weight:700;
    transition:all 0.2s;
    flex-shrink:0;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .breach-alert-close:hover {
    background:rgba(255,92,92,0.2);
  }

  /* Breached Password Item */
  .pass-item-breached {
    border-color:rgba(255,92,92,0.5) !important;
    background:rgba(255,92,92,0.05) !important;
  }
  .pass-item-breached .pass-avatar {
    box-shadow:0 0 12px rgba(255,92,92,0.4) !important;
  }
  .pass-breach-status {
    color:var(--coral);
    font-size:clamp(0.8rem,1.8vw,0.88rem);
    font-weight:600;
    margin-top:4px;
    display:flex;
    align-items:center;
    gap:4px;
  }

  @keyframes slide-down {
    from { opacity:0; transform:translateY(-16px); }
    to { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity:1; }
    50% { opacity:0.6; transform:scale(0.95); }
  }

  .dash-add-btn {
    margin-top:14px; width:100%;
    background:rgba(200,255,0,0.07); border:1.5px dashed rgba(200,255,0,0.3);
    color:var(--lime); font-weight:700; border-radius:16px; padding:clamp(12px,2vw,14px);
    cursor:pointer; font-family:'DM Sans',sans-serif; font-size:clamp(0.88rem,2vw,0.95rem); transition:all 0.2s;
  }
  .dash-add-btn:hover { background:rgba(200,255,0,0.13); }

  .toast {
    position:fixed; bottom:clamp(16px,3vw,28px); right:clamp(16px,3vw,28px);
    background:var(--card); border:1.5px solid var(--lime);
    color:var(--lime); border-radius:14px; padding:12px 20px;
    font-weight:600; font-size:clamp(0.82rem,2vw,0.9rem);
    animation:toast-in 0.3s ease; z-index:9998;
    box-shadow:0 8px 30px rgba(0,0,0,0.4); max-width:calc(100vw - 32px);
  }
  @keyframes toast-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .hamburger { display: flex; }
    .form-row { grid-template-columns: 1fr; }
    .stats { margin: 0 clamp(12px,3vw,20px); }
  }

  @media (max-width: 480px) {
    .hero h1 br { display: none; }
    .hero-cta { flex-direction: column; align-items: center; }
    .hero-cta .btn { width: 100%; max-width: 300px; }
    .pass-strength { display: none; }
    .stats { flex-wrap: wrap; }
    .stat { min-width: 50%; border-right: none; border-bottom: 1px solid var(--border); }
    .stat:last-child { border-bottom: none; }
    .footer { flex-direction: column; }
  }

  @media (max-width: 360px) {
    .auth-card { padding: 22px 14px; }
    .dash-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (min-width: 1400px) {
    .hero { padding: 120px 80px 80px; }
    .dashboard { max-width: 1200px; }
  }

  /* THANK YOU PAGE */
  .thank-you-wrap {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(20px, 4vw, 40px);
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .thank-you-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.1;
    pointer-events: none;
  }

  .thank-you-blob-1 {
    width: clamp(200px, 40vw, 500px);
    height: clamp(200px, 40vw, 500px);
    background: var(--lime);
    top: -20%;
    left: -10%;
  }

  .thank-you-blob-2 {
    width: clamp(180px, 35vw, 400px);
    height: clamp(180px, 35vw, 400px);
    background: var(--sky);
    bottom: -15%;
    right: -5%;
  }

  .thank-you-content {
    max-width: 500px;
    z-index: 10;
    animation: fade-up 0.5s ease both;
  }

  .thank-you-emoji {
    font-size: clamp(60px, 15vw, 120px);
    margin-bottom: 24px;
    animation: bounce-emoji 0.6s ease-in-out;
  }

  @keyframes bounce-emoji {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  .thank-you-title {
    font-family: 'Fredoka One', cursive;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    background: linear-gradient(90deg, var(--lime), var(--sky));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 16px;
    font-weight: 700;
  }

  .thank-you-subtitle {
    font-size: clamp(1rem, 3vw, 1.3rem);
    color: var(--text);
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .thank-you-message {
    font-size: clamp(0.9rem, 2vw, 1rem);
    color: var(--muted);
    margin-bottom: 32px;
    line-height: 1.8;
  }

  .thank-you-buttons {
    display: flex;
    gap: clamp(12px, 2vw, 16px);
    justify-content: center;
    flex-wrap: wrap;
  }

  .thank-you-buttons .btn {
    min-width: 140px;
  }`;

const passwords = [
  { site:"GitHub", icon:"🐙", user:"alex@email.com", strength:"strong", encryptedPassword:"U2FsdGVkX1+5T4f2n3K8pL9mN2oQ4rS6tU7vW8xY9zA=", password:"SecureGH2024!", email:"john.dev@company.com", breachStatus: { isBreached: false, count: 0, lastChecked: new Date().toISOString() } },
  { site:"Notion", icon:"📝", user:"alex@email.com", strength:"strong", encryptedPassword:"U2FsdGVkX1+5T4f2n3K8pL9mN2oQ4rS6tU7vW8xY9zB=", password:"NotonPass@2024", email:"john.dev@company.com", breachStatus: { isBreached: false, count: 0, lastChecked: new Date().toISOString() } },
  { site:"Twitter", icon:"🐦", user:"@alexdev", strength:"medium", encryptedPassword:"U2FsdGVkX1+5T4f2n3K8pL9mN2oQ4rS6tU7vW8xY9zC=", password:"Twitter123", email:null, breachStatus: { isBreached: false, count: 0, lastChecked: new Date().toISOString() } },
  { site:"Netflix", icon:"🎬", user:"alex@email.com", strength:"weak", encryptedPassword:"U2FsdGVkX1+5T4f2n3K8pL9mN2oQ4rS6tU7vW8xY9zD=", password:"netflix123", email:null, breachStatus: { isBreached: false, count: 0, lastChecked: new Date().toISOString() } },
  { site:"Spotify", icon:"🎵", user:"alex@email.com", strength:"strong", encryptedPassword:"U2FsdGVkX1+5T4f2n3K8pL9mN2oQ4rS6tU7vW8xY9zE=", password:"SpotifyMusicPro2024!", email:"john.dev@company.com", breachStatus: { isBreached: false, count: 0, lastChecked: new Date().toISOString() } },
];
const avatarBg = { GitHub:"#2A2A36", Notion:"#2A362A", Twitter:"#2A3036", Netflix:"#362A2A", Spotify:"#2A3630" };

function strengthInfo(s) {
  if (s==="strong") return { label:"Strong", width:"90%", color:"#C8FF00", cls:"ps-strong" };
  if (s==="medium") return { label:"Medium", width:"55%", color:"#FF9A3C", cls:"ps-medium" };
  return { label:"Weak", width:"25%", color:"#FF5C5C", cls:"ps-weak" };
}
function getPasswordStrength(pw) {
  if (!pw) return { width:"0%", color:"#2E2E40", label:"" };
  let score = 0;
  if (pw.length>=8) score++; if (pw.length>=12) score++;
  if (/[A-Z]/.test(pw)) score++; if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score<=1) return { width:"20%", color:"#FF5C5C", label:"Weak" };
  if (score<=3) return { width:"55%", color:"#FF9A3C", label:"Medium" };
  return { width:"90%", color:"#C8FF00", label:"Strong" };
}

function Nav({ setPage, loggedIn, setLoggedIn, userName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  const handleLogout = () => {
    setLoggedIn(false);
    setPage("thankYou");
    close();
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-logo" onClick={() => { setPage("home"); close(); }}>
          <div className="nav-logo-icon">🔐</div>
          PassProtector
        </div>
        <div className="nav-links">
          {loggedIn ? (
            <>
              <div style={{display:"flex",alignItems:"center",gap:"8px",color:"var(--text)",fontWeight:"600",fontSize:"clamp(0.85rem,2vw,0.95rem)"}}>
                👤 {userName}
              </div>
              <button className="btn btn-ghost" onClick={() => setPage("analyzer")}>🔍 Analyzer</button>
              <button className="btn btn-ghost" onClick={() => setPage("dashboard")}>Dashboard</button>
              <button className="btn btn-coral" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setPage("login")}>Log in</button>
              <button className="btn btn-primary" onClick={() => setPage("register")}>Get Started</button>
            </>
          )}
        </div>
        <button className={`hamburger${menuOpen?" open":""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span/><span/><span/>
        </button>
      </nav>
      <div className={`mobile-menu${menuOpen?" open":""}`}>
        <div style={{position:"absolute",top:16,right:20}}>
          <button className="hamburger open" onClick={close}><span/><span/><span/></button>
        </div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:"1.5rem",
          background:"linear-gradient(90deg,#C8FF00,#38CFFF)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
          🔐 PassProtector
        </div>
        {loggedIn ? (
          <>
            <div style={{color:"var(--text)",fontWeight:"600",marginBottom:"16px",fontSize:"1rem"}}>👤 Welcome, {userName}!</div>
            <button className="btn btn-ghost" onClick={() => { setPage("analyzer"); close(); }}>🔍 Analyzer</button>
            <button className="btn btn-ghost" onClick={() => { setPage("dashboard"); close(); }}>Dashboard</button>
            <button className="btn btn-coral" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => { setPage("login"); close(); }}>Log in</button>
            <button className="btn btn-primary" onClick={() => { setPage("register"); close(); }}>Get Started 🚀</button>
          </>
        )}
      </div>
    </>
  );
}

function Home({ setPage }) {
  const features = [
    { icon:"🔒", title:"Military-Grade Encryption", desc:"AES-256 encryption keeps your data safe from prying eyes.", color:"lime" },
    { icon:"⚡", title:"Instant Autofill", desc:"One click to fill credentials anywhere. No more remembering.", color:"coral" },
    { icon:"🌐", title:"Cross-Device Sync", desc:"Access your vault on phone, tablet, and desktop seamlessly.", color:"sky" },
    { icon:"🛡️", title:"Breach Alerts", desc:"Real-time monitoring alerts you if your data is ever compromised.", color:"violet" },
  ];
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-blob hero-blob-1"/><div className="hero-blob hero-blob-2"/><div className="hero-blob hero-blob-3"/>
        <div className="hero-tag">✨ The smartest password manager</div>
        <h1>Stop <span className="accent-coral">forgetting</span>.<br/>Start <span className="accent-lime">protecting</span>.</h1>
        <p className="hero-sub">PassProtector keeps every password locked down, autofilled, and breach-monitored — so you never have to think about it again.</p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => setPage("register")}>🚀 Get started free</button>
          <button className="btn btn-ghost" onClick={() => setPage("login")}>Log in →</button>
        </div>
      </section>
      <div className="stats">
        {[["50K+","Users protected"],["99.9%","Uptime"],["0","Breaches ever"],["256-bit","Encryption"]].map(([n,l],i) => (
          <div className="stat" key={i} style={{animationDelay:`${i*0.1}s`}}>
            <div className="stat-num">{n}</div><div className="stat-label">{l}</div>
          </div>
        ))}
      </div>
      <section className="features">
        <div className="section-title">Everything you need 🔐</div>
        <div className="feature-grid">
          {features.map((f,i) => (
            <div className={`feature-card fc-${f.color}`} key={i} style={{animationDelay:`${i*0.1}s`}}>
              <div className={`feature-icon fi-${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3><p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="footer">
        <div className="footer-left">🔐 PassProtector</div>
        <div className="footer-right">© 2025 PassProtector. All rights reserved.</div>
      </footer>
    </div>
  );
}

function Login({ setPage, setLoggedIn, setUserName, setUserEmail }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize Google Sign-In button
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin
      });
      google.accounts.id.renderButton(
        document.getElementById('google-login-btn'),
        { theme: 'filled_blue', size: 'large', width: '100%' }
      );
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !pw) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    
    // Simulate login delay
    setTimeout(() => {
      setUserName(email.split('@')[0]);
      setUserEmail(email);
      setLoggedIn(true);
      setPage("dashboard");
      setLoading(false);
    }, 500);
  };

  const handleGoogleLogin = (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const result = handleGoogleSignInSuccess(credentialResponse);
      if (result.success) {
        setUserName(result.name || result.email.split('@')[0]);
        setUserEmail(result.email);
        setLoggedIn(true);
        setPage("dashboard");
      } else {
        setError(result.error || "Google Sign-In failed");
      }
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-blob auth-blob-1"/><div className="auth-blob auth-blob-2"/>
      <div className="auth-card">
        <div className="auth-logo"><div className="auth-logo-icon">🔐</div><div className="auth-logo-text">PassProtector</div></div>
        <h2>Welcome back 👋</h2>
        <p className="auth-sub">Log in to access your vault</p>
        {error && <div style={{background:"rgba(255,92,92,0.15)",color:"var(--coral)",padding:"10px",borderRadius:"8px",marginBottom:"16px",fontSize:"0.9rem"}}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />
        </div>
        <div className="form-group">
          <label className="form-label">Master password</label>
          <div className="input-wrap">
            <input className="form-input" type={show?"text":"password"} placeholder="••••••••••" value={pw} onChange={e=>setPw(e.target.value)} disabled={loading} />
            <button className="input-eye" onClick={()=>setShow(!show)} disabled={loading}>{show?"🙈":"👁️"}</button>
          </div>
        </div>
        <div style={{textAlign:"right",marginBottom:"18px"}}>
          <a style={{color:"var(--sky)",fontSize:"0.85rem",cursor:"pointer"}}>Forgot password?</a>
        </div>
        <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Unlock vault 🔓"}
        </button>
        <div style={{margin:"18px 0"}}>
          <div id="google-login-btn"></div>
        </div>
        <div className="divider">or continue with</div>
        <div className="social-btns">
          <button className="btn-social" disabled={loading}>⬛ GitHub</button>
        </div>
        <div className="auth-switch">Don't have an account? <a onClick={() => setPage("register")}>Sign up free →</a></div>
      </div>
    </div>
  );
}

function Register({ setPage, setLoggedIn, setUserName, setUserEmail }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strength = getPasswordStrength(pw);
  const valid = name && email && pw && pw===pw2 && agree;

  useEffect(() => {
    // Initialize Google Sign-In button for Register
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleRegister
      });
      google.accounts.id.renderButton(
        document.getElementById('google-register-btn'),
        { theme: 'filled_blue', size: 'large', width: '100%' }
      );
    }
  }, []);

  const handleRegister = async () => {
    if (!valid) {
      setError("Please fill all fields correctly");
      return;
    }
    setLoading(true);
    setError("");
    
    // Simulate registration delay
    setTimeout(() => {
      setUserName(name);
      setUserEmail(email);
      setLoggedIn(true);
      setPage("dashboard");
      setLoading(false);
    }, 500);
  };

  const handleGoogleRegister = (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const result = handleGoogleSignInSuccess(credentialResponse);
      if (result.success) {
        setUserName(result.name || result.email.split('@')[0]);
        setUserEmail(result.email);
        setLoggedIn(true);
        setPage("dashboard");
      } else {
        setError(result.error || "Google Sign-In failed");
      }
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-blob auth-blob-1"/><div className="auth-blob auth-blob-2"/>
      <div className="auth-card">
        <div className="auth-logo"><div className="auth-logo-icon">🔐</div><div className="auth-logo-text">PassProtector</div></div>
        <h2>Create account 🎉</h2>
        <p className="auth-sub">Start protecting your passwords today</p>
        {error && <div style={{background:"rgba(255,92,92,0.15)",color:"var(--coral)",padding:"10px",borderRadius:"8px",marginBottom:"16px",fontSize:"0.9rem"}}>{error}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First name</label>
            <input className="form-input" placeholder="Alex" value={name} onChange={e=>setName(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label className="form-label">Last name</label>
            <input className="form-input" placeholder="Smith" disabled={loading} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />
        </div>
        <div className="form-group">
          <label className="form-label">Master password</label>
          <div className="input-wrap">
            <input className="form-input" type={show?"text":"password"} placeholder="Create a strong password" value={pw} onChange={e=>setPw(e.target.value)} disabled={loading} />
            <button className="input-eye" onClick={()=>setShow(!show)} disabled={loading}>{show?"🙈":"👁️"}</button>
          </div>
          {pw && <><div className="strength-bar"><div className="strength-fill" style={{width:strength.width,background:strength.color}}/></div>
            <div className="strength-label" style={{color:strength.color}}>{strength.label} password</div></>}
        </div>
        <div className="form-group">
          <label className="form-label">Confirm password</label>
          <input className="form-input" type="password" placeholder="Repeat your password"
            value={pw2} onChange={e=>setPw2(e.target.value)}
            disabled={loading}
            style={pw2&&pw!==pw2?{borderColor:"var(--coral)"}:{}} />
          {pw2&&pw!==pw2&&<div style={{color:"var(--coral)",fontSize:"0.78rem",marginTop:5}}>Passwords don't match</div>}
        </div>
        <div className="checkbox-wrap">
          <input type="checkbox" id="terms" checked={agree} onChange={e=>setAgree(e.target.checked)} disabled={loading} />
          <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
        </div>
        <button className="btn btn-violet btn-full" style={{opacity:valid?1:0.5}}
          onClick={handleRegister} disabled={loading || !valid}>
          {loading ? "Creating vault..." : "Create my vault 🔐"}
        </button>
        <div style={{margin:"18px 0"}}>
          <div id="google-register-btn"></div>
        </div>
        <div className="divider">or continue with</div>
        <div className="social-btns">
          <button className="btn-social" disabled={loading}>⬛ GitHub</button>
        </div>
        <div className="auth-switch">Already have an account? <a onClick={() => setPage("login")}>Log in →</a></div>
      </div>
    </div>
  );
}

function Dashboard({ userName, userEmail }) {
  const [toast, setToast] = useState(null);
  const [viewingPassword, setViewingPassword] = useState(null);
  const [showAlerts, setShowAlerts] = useState(true);
  
  // Create password list with user's email for breach detection
  const dashboardPasswords = passwords.map((p, i) => ({
    ...p,
    email: isProperEmail(userEmail) ? userEmail : p.email,
    displayEmail: isProperEmail(userEmail) ? userEmail : p.user
  }));
  
  // Only count breaches for passwords with proper email addresses
  const breachedCount = dashboardPasswords.filter(p => isProperEmail(p.email) && p.breachStatus?.isBreached).length;
  const strongCount = passwords.filter(p => p.strength === "strong").length;
  const weakCount = passwords.filter(p => p.strength === "weak").length;
  
  const copy = (site) => { setToast(`✅ ${site} password copied!`); setTimeout(()=>setToast(null),2000); };
  
  const viewPassword = (index) => {
    setViewingPassword(viewingPassword === index ? null : index);
    if (viewingPassword !== index) {
      setToast(`🔓 Password decrypted with AES-256`);
      setTimeout(() => setToast(null), 2000);
    }
  };

  
  return (
    <div className="dashboard">
      {breachedCount > 0 && showAlerts && (
        <div className="breach-alert-banner">
          <div className="breach-alert-content">
            <div className="breach-alert-icon">⚠️</div>
            <div className="breach-alert-text">
              <strong>{breachedCount} {breachedCount === 1 ? 'password has' : 'passwords have'} been compromised!</strong>
              <p>These passwords were found in public breaches. You should change them immediately.</p>
            </div>
            <button className="breach-alert-close" onClick={() => setShowAlerts(false)}>✕</button>
          </div>
        </div>
      )}
      
      <div className="dash-header">
        <h1>Good morning, <span>{userName}!</span> 👋</h1>
        <p>You have {passwords.length} passwords stored securely with <strong>AES-256 encryption</strong>.</p>
      </div>
      
      <div className="dash-grid">
        {[
          {num:passwords.length,label:"Total passwords",emoji:"🔑",color:"var(--violet)"},
          {num:strongCount,label:"Strong passwords",emoji:"💪",color:"var(--lime)"},
          {num:weakCount,label:"Weak passwords",emoji:"⚠️",color:"var(--coral)"},
          {num:breachedCount,label:"Compromised",emoji:"🛡️",color:breachedCount > 0 ? "var(--coral)" : "var(--sky)"},
        ].map((s,i) => (
          <div className="dash-stat-card" key={i} data-emoji={s.emoji} style={{animationDelay:`${i*0.08}s`}}>
            <div className="dash-stat-num" style={{color:s.color}}>{s.num}</div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      
      <div className="dash-recent">
        <h2>Recent passwords</h2>
        <div className="pass-list">
          {dashboardPasswords.map((p,i) => {
            const si = strengthInfo(p.strength);
            // Only show breach status for passwords with proper email addresses
            const isBreach = isProperEmail(p.email) && p.breachStatus?.isBreached;
            return (
              <div className={`pass-item ${isBreach ? 'pass-item-breached' : ''}`} key={i}>
                <div className="pass-avatar" style={{background:avatarBg[p.site]||"#2A2A36"}}>{p.icon}</div>
                <div className="pass-info">
                  <div className="pass-name">{p.site}</div>
                  <div className="pass-user">{p.displayEmail}</div>
                  {isBreach && (
                    <div className="pass-breach-status" title={`Found in ${p.breachStatus.count} breaches`}>
                      🚨 Found in {p.breachStatus.count} breach{p.breachStatus.count > 1 ? 'es' : ''}
                    </div>
                  )}
                  {viewingPassword === i && (
                    <div className="pass-decrypted" style={{color:"var(--lime)", fontSize:"0.85rem", marginTop:"4px", fontFamily:"'Space Mono', monospace"}}>
                      🔓 Encrypted data visible (demo mode)
                    </div>
                  )}
                </div>
                <span className={`pass-strength ${si.cls}`}>{si.label}</span>
                <button className="pass-view" onClick={() => viewPassword(i)} title="View encrypted password">
                  {viewingPassword === i ? "👁️ Hide" : "👁️"}
                </button>
                <button className="pass-copy" onClick={()=>copy(p.site)}>📋</button>
              </div>
            );
          })}
        </div>
        <button className="dash-add-btn">+ Add new password</button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function ThankYou({ setPage }) {
  useEffect(() => {
    // Auto redirect to home after 4 seconds
    const timer = setTimeout(() => {
      setPage("home");
    }, 4000);
    return () => clearTimeout(timer);
  }, [setPage]);

  return (
    <div className="thank-you-wrap">
      <div className="thank-you-blob thank-you-blob-1"/>
      <div className="thank-you-blob thank-you-blob-2"/>
      <div className="thank-you-content">
        <div className="thank-you-emoji">👋</div>
        <h1 className="thank-you-title">Thank you!</h1>
        <p className="thank-you-subtitle">You've been logged out successfully</p>
        <p className="thank-you-message">
          Thanks for using PassProtector to keep your passwords secure. <br/>
          We're here whenever you need us! 🔐
        </p>
        <div className="thank-you-buttons">
          <button className="btn btn-ghost" onClick={() => setPage("home")}>← Back to Home</button>
          <button className="btn btn-primary" onClick={() => setPage("login")}>Log in Again →</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [fade, setFade] = useState(false);
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Alex");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 2000);
    const t2 = setTimeout(() => setLoaded(true), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <>
      <style>{style}</style>
      <div className="noise-wrap">
        {!loaded && (
          <div className={`loader-wrap${fade?" fade-out":""}`}>
            <div className="logo-mark">
              <div className="logo-ring"/><div className="logo-ring"/><div className="logo-ring"/>
              <div className="logo-inner">🔐</div>
            </div>
            <div className="loader-brand">PassProtector</div>
            <div className="loader-dots"><span/><span/><span/></div>
          </div>
        )}
        {loaded && (
          <div className="app">
            {page !== "thankYou" && <Nav setPage={setPage} loggedIn={loggedIn} setLoggedIn={setLoggedIn} userName={userName} />}
            {page==="home"      && <Home setPage={setPage} />}
            {page==="login"     && <Login setPage={setPage} setLoggedIn={setLoggedIn} setUserName={setUserName} setUserEmail={setUserEmail} />}
            {page==="register"  && <Register setPage={setPage} setLoggedIn={setLoggedIn} setUserName={setUserName} setUserEmail={setUserEmail} />}
            {page==="dashboard" && <Dashboard userName={userName} userEmail={userEmail} />}
            {page==="analyzer"  && <PasswordStrengthAnalyzer />}
            {page==="thankYou"  && <ThankYou setPage={setPage} />}
          </div>
        )}
      </div>
    </>
  );
}
