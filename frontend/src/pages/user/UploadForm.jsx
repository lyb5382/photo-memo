import React from 'react'
import './UploadForm.scss'

const UploadForm = () => {
    return (
        <section className='am-backdrop'>
            <form className="am-panel Upload-form">
                <header>
                    <h2>file upload</h2>
                    <p className="sub">img & memo</p>
                </header>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="title">title</label>
                        <input id='title' type="text" placeholder='제목 입력' />
                    </div>
                    <div className="field">
                        <label htmlFor="content">content</label>
                        <textarea id='content' placeholder='내용 입력' rows={3}></textarea>
                    </div>
                    <div className="field">
                        <div className="file-row">
                            <input accept='image/*' type="file" />
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <button className="btn ghost">❌</button>
                    <button className="btn primary">⬆️</button>
                </div>
            </form>
        </section>
    )
}

export default UploadForm
