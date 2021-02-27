import React from 'react'

export default function OtherInfo(props) {
    const { infos } = props
    return (
        <div className="other-info">
            <ul>
                {
                    infos.map(({ icon, value }, i) => {
                        return <li key={i}>
                            <i className={"icon iconfont " + `icon-${icon}`} />
                            <span>{value}</span>
                        </li>
                    })
                }

            </ul>
        </div>
    )
}
