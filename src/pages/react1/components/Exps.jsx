import React from 'react'

export default function Exps(props) {
    const { exps } = props
    return (
        <ul>
            {
                exps.map((exp, i) => {
                    const { title, values = [] } = exp
                    return <li className="exp" key={i}>
                        <div className="h3">{title}</div>
                        <div className="hr"></div>
                        {
                            values.map((v, j) => {
                                const { des, introduce } = v
                                return <div key={j}>
                                    {!!des && des.length > 0 &&
                                        <p className="des">
                                            {des.map((d, k) => {
                                                return d && <span key={k}>{d}</span>
                                            })}
                                        </p>
                                    }
                                    {
                                        introduce && introduce.length > 0 &&
                                        <div className="introduce">
                                            {introduce.map((p, l) => {
                                                return <p key={l}>{p}</p>
                                            })}
                                        </div>
                                    }

                                </div>
                            })
                        }

                    </li>
                })
            }
        </ul>
    )
}
