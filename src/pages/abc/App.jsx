import React, { useEffect, useState } from 'react'
import { getSchema } from '../../utils'

export default function App() {
    const [schema, updateSchema] = useState(getSchema())
    const { name, position, infos = [] } = schema
    useEffect(() => {
        window.refresh = function () {
            updateSchema(getSchema())
        }
    }, [])
    return (
        <div>
            <header>
                <h1>{name}</h1>
                <h2>{position}</h2>
            </header>
            <div className="infos">
                {
                    infos.map((info, i) => {
                        return <p key={i}>{info}</p>
                    })
                }
            </div>
        </div>
    )
}
