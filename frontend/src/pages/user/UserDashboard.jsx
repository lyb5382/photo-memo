import React, { useState } from 'react'
import UploadForm from './UploadForm'
import FileList from './FileList'
import './UserDashboard.scss'
import { uploadToS3 } from '../../api/postApi'
import { usePosts } from '../../hooks/usePosts'

const UserDashboard = () => {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const { it, loading, load, add } = usePosts()
    const handleupload = async ({ title, content, file }) => {
        try {
            const key = file ? await uploadToS3(file) : null
            console.log('s3 ok!!', key)
            const created = await add({ title, content, filekey: key ? [key] : [] })
            console.log('db ok!!', created)
        } catch (error) {
            console.error('uploaded failed', error)
        }
    }

    return (
        <section>
            <div className="inner">
                <div className="search-warp">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='검색' />
                    <button className='btn primary' onClick={() => setOpen(true)}>upload</button>
                </div>
            </div>
            <div className="inner">
                {open && (
                    <UploadForm onUploaded={handleupload} open={open} onClose={() => setOpen(false)} />
                )}
            </div>
            <FileList />
        </section>
    )
}

export default UserDashboard
