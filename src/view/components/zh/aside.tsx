import { Mycontext } from '../../../utils/useApp'
import { notification, Space } from 'antd'
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import '../../css/aside.css'
import moment from 'moment'
import { setInterval } from 'timers'
import { useTranslation } from 'react-i18next'
// import asidePng from '../../utils/img/aside.png'
// console.log(asidePng)
type el = {
    onClick: Function
}
const Aside: React.FC<el> = (props: any) => {

    const { t, i18n } = useTranslation()
    const l = i18n.language
    const setl = i18n.changeLanguage
    /**获取合约对象 */
    const contract = useContext(Mycontext)
    const [pos, setPos] = useState<String>('简体中文')
    const [reward, setReward] = useState('0.0000')
    const [times, setTimes] = useState('00:00:00')
    const [balanceOf, setMoney] = useState('0')
    // 邀请奖励
    const [invite, setIv] = useState('0.0000')

    const changeLang = (e: Event, type: string) => {
        e.stopPropagation()
        setl(type)
        setPos(type === 'zh-CN' ? '简体中文' : "English")
    }
    const [router, setHash] = useState(0)
    const history = useHistory()
    /**
     * 提取奖励
     */
    const claim = (e: any) => {
        e.stopPropagation()
        if (times !== '00:00:00') return
        contract?.claim()
            .then((res: any) => {
                contract.accountInfo && contract.accountInfo().then((res: any) => {
                    setReward((Number(res.reward) / 1e18).toFixed(4))
                    setIv((Number(res.dgeReward) / 1e18).toFixed(4))
                })
                notification.success({
                    message: t('tqcg')
                })
            })
            .catch((err: any) => {
                notification.warn({
                    message: t('tqsb')
                })
            })
    }
    const [tab, dispath] = useReducer((state: Number, action: number) => {
        setHash(action)
        let router = '/'
        switch (action) {
            case 0: (router = '/'); break
            case 1: (router = '/mt'); break
            case 2: (router = '/fh'); break
            case 3: (router = '/tm'); break
            case 4: (router = '/tg'); break
            case 5: (router = '/cp'); break
            // case 6: (router = '/vw'); break
        }
        history.push(router)
        props.onClick(false)
        return action
    }, 0)
    const callback = useCallback((e: Event, count: number) => {
        dispath(count)
    }, [])
    useEffect(() => {
        contract.balanceOf && contract.balanceOf().then((res: any) => {
            console.log(res)
            setMoney((res / 1e18).toFixed(4))
        })
        let router: any = '', parent: any = ''
        if (window.location.hash.includes('?')) {
            router = window.location.hash.match(/#(.*)\?/)?.[1]
            parent = window.location.hash.match(/.*?id=(.*)$/)?.[1]
            if (parent && contract.accountInfo) {
                contract.accountInfo().then((res: any) => {
                    if (!Number(res.inviter) && parent !== contract.defaultAccount) {
                        contract.bind(parent).catch((err: any) => { console.log(err) })
                    }
                }).catch((err: any) => {
                    console.log(err)
                })
            }
        } else {
            router = window.location.hash.match(/#(.*)$/)?.[1]
        }
        const obj = ['/', '/mt', '/fh', '/tm', '/tg']
        let num = obj.findIndex(i => i === router)
        setHash(num)
    }, [contract])
    useEffect(() => {
        let timers: any = ''
        const func = () => {
            contract.accountInfo && contract.accountInfo().then((res: any) => {
                setReward((Number(res.reward) / 1e18).toFixed(4))
                setIv((Number(res.dgeReward) / 1e18).toFixed(4))
                if (Number(res.claimAt) > 0) {
                    const dayAddOne = moment(+(res.claimAt + '000')).add('1', 'd').valueOf()
                    const nowDay = moment().valueOf()
                    // 当前时间小于可提取时间
                    if (nowDay < dayAddOne && !timers) {
                        let gap = dayAddOne - nowDay// 获取倒计时时间
                        timers = setInterval(() => {
                            if (gap <= 0) {
                                setTimes('00:00:00')
                                clearInterval(timers)
                                timers = null
                            } else {
                                gap -= 1000
                                let hour = Math.floor(gap / (1000 * 60 * 60))
                                let minute = Math.floor(gap % (1000 * 60 * 60) / (1000 * 60))
                                let second = Math.floor(gap % (1000 * 60 * 60) % (1000 * 60) / 1000)
                                setTimes(`${String(hour).length < 2 ? '0' + hour : hour}:${String(minute).length < 2 ? '0' + minute : minute}:${String(second).length < 2 ? '0' + second : second}`)
                            }
                        }, 1000)
                    }
                }
            })
        }
        let time = setInterval(func, 5000)
        func()
        return () => {
            clearInterval(timers)
            timers = null
            clearInterval(time)
        }
    }, [contract])
    const display = window.innerWidth < 600 ? 'flex' : 'none'
    return (
        <div className="bg-btn" onClick={props.onClick}>
            <Space direction="vertical" className="element-buts" style={{ gap: '0px' }}>
                <div>
                    <img src={require('../../../utils/img/logo.png').default} alt="" style={{ width: '100%', marginBottom: '30px' }} />
                </div>
                <div className={router === 4 ? "aside-btn active-btu" : "aside-btn"} onClick={(e: any) => callback(e, 4)} >
                    <img src={router === 4 ? require('../../../utils/img/desktop/active-btn-role.png').default : require('../../../utils/img/desktop/lazy-btn-role.png').default} alt="" style={{ width: '100%' }} />
                </div>
                <div className={router === 0 ? "aside-btn active-btu" : "aside-btn"} onClick={(e: any) => callback(e, 0)} >
                    <img src={router === 0 ? require('../../../utils/img/desktop/active-btn-hero.png').default : require('../../../utils/img/desktop/lazy-btn-hero.png').default} alt="" style={{ width: '100%' }} />
                </div>
                <div className={router === 5 ? "aside-btn active-btu" : "aside-btn"} onClick={(e: any) => callback(e, 5)} >
                    <img src={router === 5 ? require('../../../utils/img/desktop/active-btn-trading.png').default : require('../../../utils/img/desktop/lazy-btn-trading.png').default} alt="" style={{ width: '100%' }} />
                </div>
                <div className={router === 1 ? "aside-btn active-btu" : "aside-btn"} onClick={(e: any) => callback(e, 1)} >
                    <img src={router === 1 ? require('../../../utils/img/desktop/active-btn-training.png').default : require('../../../utils/img/desktop/lazy-btn-training.png').default} alt="" style={{ width: '100%' }} />
                </div>
                <div className={router === 2 ? "aside-btn active-btu" : "aside-btn"} onClick={(e: any) => callback(e, 2)} >
                    <img src={router === 2 ? require('../../../utils/img/desktop/active-btn-invite.png').default : require('../../../utils/img/desktop/lazy-btn-invite.png').default} alt="" style={{ width: '100%' }} />
                </div>
                {/* <div className={router === 3 ? "aside-btn active-btu" : "aside-btn"} onClick={(e: any) => callback(e, 3)} >
                    <img src={require('../../../utils/img/desktop/jysc.png').default} alt="" style={{ width: '100%' }} />
                </div>
                <div className={router === 6 ? "aside-btn active-btu" : "aside-btn"} style={{ position: 'relative' }}>
                    <a href='/恐龙乐园.pdf' style={{ left: 0, right: 0, height: '100%', position: "absolute" }}></a>
                    <img src={require('../../../utils/img/desktop/bps.png').default} alt="" style={{ width: '100%' }} />
                </div>
                <div className="blance mobile-btn" style={{ flexDirection: 'column', display }}>
                    <span style={{ fontSize: '1.5em' }}>{t('zhye')}：</span>
                    <span style={{ fontSize: '1.5em' }}>{balanceOf} gToken</span>
                </div>
                <div style={{ position: 'relative' }} className="bg-lang2">
                    <div className="child-style">
                        <img src={require('../../../utils/img/desktop/tq.png').default} className="child-style tq-but" alt="" onClick={(e: any) => { claim(e) }} style={{ visibility: 'hidden' }} />
                        <div style={{ flex: 1, marginRight: '10px' }}>
                            <div>{t('tgjl')}{Number(invite) ? t('booked') : ''}</div>
                            <div>{invite} gToken</div></div>
                    </div>
                    <div className="child-style">
                        <img src={require('../../../utils/img/desktop/tq.png').default} className="child-style tq-but" style={{ top: '70px' }} alt="" onClick={(e: any) => { claim(e) }} />
                        <div style={{ flex: 1, marginRight: '10px' }}>
                            <div>{t('fhjl')} </div>
                            <div>{reward} gToken</div></div>
                    </div>
                    <div className="absolute-down">{times}</div>
                </div> */}
                <div>
                    <div className="mobile-btn bg-lang" onClick={(e: any) => { changeLang(e, 'zh-CN') }} style={{ color: l === 'en' ? '#d6cdcd' : '#fff' }}>简体中文</div>
                    <div className="mobile-btn bg-lang" onClick={(e: any) => { changeLang(e, 'en') }} style={{ color: l === 'en' ? '#fff' : '#d6cdcd' }}>English</div>
                </div>
                {/* <img src={asidePng} alt="" style={{height:'100px',width:'130px'}}></img> */}
            </Space>
        </div>
    )
}
export default Aside