import React from 'react'
import AuthModal from './AuthModal'
import './AuthPanel.scss'

const AuthPanel = () => {
    return (
        <section className='container-sm admin-card'>
            <header className='admin-head'>
                <h1 className='title'>관리자 인증</h1>
                <p>
                    버튼 → 모달에서 로그인/회원가입 → 토큰 저장 → /me 호출
                </p>
            </header>
            {/* 로그인 전 */}
            <div className="auth-row">
                <button className="btn btn-primary">
                    로그인 / 회원가입
                </button>
            </div>
            {/* 로그인 후 */}
            <div className="auth-row">
                <span>안녕하세요 <b>사용자 명 또는 이메일</b> </span>
                <span className="badge badge-ok">admin</span>
                <div className="auth-actions">
                    <button className="btn">/me 호출</button>
                    <button className="btn">로그아웃</button>
                </div>
            </div>
            {/* 권한 없음 경고 */}
            <div className="alert alert-warn">
                현재 계정에는 관리자 권한이 없습니다. 관리자 승인이 필요합니다.
            </div>
            {/* 사용자 정보 예시 */}
            <pre className="code">
                {`{
      "id": "123",
      "email": "test@example.com",
      "role": "admin"
       }`}
            </pre>
            <AuthModal />
        </section>
    )
}

export default AuthPanel
