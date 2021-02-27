import React from 'react'

export default function BaseInfo(props) {
    const { name, position } = props
    return (
        <div className="base-info">
            <h1>{name}</h1>
            <h2>{position}</h2>
        </div>
    )
}
