import React, { useRef, useState } from 'react'
import './UploadForm.scss'

const UploadForm = ({ onUploaded, initail, onClose }) => {
    const [form, setForm] = useState({
        title: initail?.title ?? '',
        content: initail?.content ?? '',
        file: null,
        preview: null
    })
    const [uploading, setUploading] = useState(false)
    const panelRef = useRef(null)

    const handlefilechange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (form.preview) URL.revokeObjectURL(form.preview)
        const previewUrl = URL.createObjectURL(file)
        setForm((prev) => ({ ...prev, file, preview: previewUrl }))
    }
    const handlesubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) {
            console.warn('title empty')
            alert('제목 입력')
            return
        }
        if (uploading) return
        try {
            setUploading(true)
            await onUploaded?.({
                title: form.title.trim(),
                content: form.content.trim(),
                file: form.file
            })
            if (form.preview) URL.revokeObjectURL(form.preview)
            setForm({ title: '', content: '', file: null, preview: null })
            onClose?.()
        } catch (error) {
            console.error('submit error', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <section className='am-backdrop'>
            <form ref={panelRef} onSubmit={handlesubmit} className="am-panel Upload-form">
                <header>
                    <h2>file upload</h2>
                    <p className="sub">img & memo</p>
                </header>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="title">title</label>
                        <input id='title' value={form.title} name='title' type="text" placeholder='제목 입력' onChange={(e) => { setForm((prev) => ({ ...prev, title: e.target.value })) }} />
                    </div>
                    <div className="field">
                        <label htmlFor="content">content</label>
                        <textarea id='content' value={form.content} name='content' placeholder='내용 입력' rows={3} onChange={(e) => { setForm((prev) => ({ ...prev, content: e.target.value })) }} ></textarea>
                    </div>
                    <div className="field">
                        <div className="file-row">
                            <input accept='image/*' name='file' type="file" onChange={handlefilechange} />
                            {form.preview && (
                                <div className='preview-warp'>
                                    <img src={form.preview} alt="미리보기" className='preview-thumb' />
                                    <p className='file-name'>{form.file?.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <button type='button' className="btn ghost" onClick={onClose} disabled={uploading}>❌</button>
                    <button type='submit' disabled={uploading} className="btn primary">
                        {uploading ? '🔄️' : '⬆️'}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default UploadForm
