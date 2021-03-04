import React from 'react'
import svgList from './../../../constants/svgs'
const $svgList = svgList('#3b8fcb')
export default function OtherInfo(props) {
    const { infos } = props
    return (
        <div className="other-info">
            <ul>
                {
                    infos.map(({ icon, value }, i) => {
                        return <li key={i}>
                            <i dangerouslySetInnerHTML={{ __html: $svgList[icon] }} />
                            <span>{value}</span>
                        </li>
                    })
                }

            </ul>
        </div >
    )
}
