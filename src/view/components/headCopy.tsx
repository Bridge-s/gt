import { Button, Drawer, Dropdown, Menu, message, notification, Space } from 'antd'
import { useI18n, setLang } from 'use-i18n'
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react'
import earthPng from '../../utils/img/earth.png'
import '../css/head.css'
import toleft from "../../utils/img/more.png"
import { Mycontext } from '../../utils/useApp'
import moment from 'moment'
import { setInterval } from 'timers'


const Head = (props: any) => {
    const t = useI18n()
    const [pos, setPos] = useState<String>('简体中文')
    const [visible, setVisible] = useState(false)
    const onClose = () => {
        props.cref?.current.setter(true)
        setVisible(true)
        props.cref.current.getter = setVisible
    }
    const [times, setTimes] = useState('00:00:00')
    const [l, setl] = setLang()
    const changeLang = (type: String) => {
        setl(type)
        setPos(type === 'zh-CN' ? '简体中文' : "English")
    }
    // 邀请奖励
    const [invite, setIv] = useState('0.0000')
    // 账户余额
    const [balaceof, setbalanceof] = useState('0.0000')
    /**
     * 获取合约方法
     */
    const contract = useContext(Mycontext)
    let isConnent = contract && contract.defaultAccount ? contract.defaultAccount : t.lj
    const [reward, setReward] = useState('0')
    // 连接
    const onConnent = () => {
        if (!contract.defaultAccount) {
            contract.createInit()
        }
    }
    /**
     * 提取奖励
     */
    const claim = () => {
        if (times !== '00:00:00') return
        contract?.claim()
            .then((res: any) => {
                notification.success({
                    message: t.tqcg
                })
            })
            .catch((err: any) => {
                notification.warn({
                    message: t.tqsb
                })
            })
    }
    const [state, dispatch] = useReducer(async (state: any, type: string) => {
        if (contract[type]) {
            if (type === 'accountInfo') {
                const res = await contract[type]()
                if (Number(res.mintCount) < 5) {
                    notification.warn({
                        message: t.syfivetimes,
                        duration: 1.5
                    })
                } else {
                    contract.copyAddress('http://www.dnftfinance.com/#/?id=' + contract.defaultAccount)
                }
            }
        }
        return state
    }, Promise.resolve(0))

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        isConnent = contract.defaultAccount ? contract.defaultAccount : t.lj
        let timer: any = ''
        const func = () => {
            contract.accountInfo && contract.accountInfo().then((res: any) => {
                setReward((Number(res.reward) / 1e18).toFixed(4))
            })

            /** */
            contract.balanceOf && contract.balanceOf().then((res: any) => {
                setbalanceof((Number(res) / 1e18).toFixed(4))
            })
            contract.accountInfo && contract.accountInfo().then((res: any) => {
                setIv((Number(res.dgeReward) / 1e18).toFixed(4))
                if (Number(res.claimAt) > 0) {
                    const dayAddOne = moment(+(res.claimAt + '000')).add('1', 'd').valueOf()
                    const nowDay = moment().valueOf()
                    // 当前时间小于可提取时间
                    if (nowDay < dayAddOne && !timer) {
                        let gap = dayAddOne - nowDay// 获取倒计时时间
                        timer = setInterval(() => {
                            if (gap <= 0) {
                                setTimes('00:00:00')
                                clearInterval(timer)
                                timer=null
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
        let times1 = setInterval(
            func
        , 5000)
        func()
        return () => {
            clearInterval(timer)
            clearInterval(times1)
            timer=null
        }
    }, [contract])

    const menu = (
        <Menu>
            <Menu.Item onClick={() => changeLang('zh-CN')} key="1">
                简体中文
            </Menu.Item>
            <Menu.Item onClick={() => changeLang('en')} key="2">
                English
            </Menu.Item>
        </Menu>
    )
    return (
        <div style={{ textAlign: 'end', padding: '20px 20px 0 0' }}>
            <Space wrap align="center" style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '20px' }}>
                <div className="mobile-btn" style={{ filter: 'brightness(1.2)' }} onClick={onClose}>
                    <img src={toleft} alt="" style={{ width: '40px', height: '40px' }} />
                </div>
                <Space wrap align="center">
                    <div className="brower-btn">
                        <div style={{ position: 'relative' }} className="bg-lang3">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ marginRight: '10px' }}>{t.yqjl}: </span>
                                <span className="timer-style2">{invite} <span style={{ fontSize: '12px' }}>gToken</span></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ marginRight: '10px' }}>{t.zhye}: </span>
                                <span className="timer-style2">{balaceof} <span style={{ fontSize: '12px' }}>gToken</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="green-btn head-btn" onClick={() => dispatch('accountInfo')}>{t.zf}</div>
                    <div style={{ position: 'relative' }} className="brower-btn">
                        <div className="green-btn head-btn" onClick={claim}>{t.jl}:{reward} gToken</div>
                        <div className="timer-style">{times}</div>
                    </div>
                    <div className="green-btn head-btn"><div style={{ maxWidth: '100px', overflow: 'hidden' }} onClick={onConnent}>{isConnent}</div></div>
                    <div className="brower-btn">
                        <Dropdown overlay={menu} placement="bottomCenter" overlayStyle={{ fontSize: '0.8em !impor' }}>
                            <Button size="large" type="text" style={{ color: '#fff', fontSize: '0.8em' }}>
                                <img src={earthPng} style={{ width: '25px', height: '25px', marginRight: '5px' }} alt="" />
                                {pos}
                            </Button>
                        </Dropdown>
                    </div>
                </Space>
            </Space>
        </div>
    )
}
export default Head