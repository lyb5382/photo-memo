import React, { useState } from 'react'
import UploadForm from './UploadForm'
import FileList from './FileList'
import './UserDashboard.scss'

const UserDashboard = () => {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
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
                    <UploadForm open={open} onClose={() => setOpen(false)} />
                )}
            </div>
            <FileList />
        </section>
    )
}

export default UserDashboard
