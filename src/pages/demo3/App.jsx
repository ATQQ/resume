import React, { useEffect, useState } from 'react'
import { getSchema } from '../../utils'

export default function App() {
    const [data, setJSON] = useState(getSchema())
    useEffect(() => {
        window.refresh = () => {
            setJSON(getSchema())
        }
    }, [])
    const { name, position, dataString } = data
    return (
        <div>
            <h1>{name}</h1>
            <h2>{position}</h2>
            {
                dataString.map((v, i) => {
                    return <h2 key={i}>{v}</h2>
                })
            }
        </div>
    )
}
