import { useCallback, useState } from 'react'
import { createPost } from "../api/postApi"

export function usePosts() {
    const [it, setIt] = useState([])
    const [loading, setLoading] = useState(false)
    const load = useCallback(async () => {
        setLoading(true)
        try {

        } catch (error) {

        }
    })
    const add = useCallback(async ({ title, content, filekey = [] }) => {
        const created = await createPost({ title, content, filekey })
        setIt((prev) => [created, ...prev])
        return created
    }, [])

    return {
        it, loading, load, add
    }
}