import api from "./client"

export const uploadToS3 = async (f) => {
    const { data: { url, key } } = await api.post('/api/upload/presign', { filename: f.name, contentType: f.type })
    const putRes = await fetch(url, {
        method: 'PUT',
        headers: { 'ContentType': f.type },
        body: f
    })
    if (!putRes) throw new Error('S3 upload failed')
    return key
}

export const createPost = async ({ title, content, filekey }) => {
    const { data } = await api.post('/api/posts', { title, content, fileUrl: filekey })
    return data
}