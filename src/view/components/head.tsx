import { Button, Dropdown, Menu, Space } from 'antd'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import earthPng from '../../utils/img/earth.png'
import '../css/head.css'
import toleft from "../../utils/img/icon/but7.png"
import { Mycontext } from '../../utils/useApp'
import { useTranslation } from 'react-i18next'

const Head = (props: any) => {
    const { t, i18n } = useTranslation()
    const l = i18n.language
    /**获取合约对象 */
    const contract = useContext(Mycontext)
    const [pos, setPos] = useState<String>('简体中文')
    const audioRef = useRef<any>()
    const imgRef = useRef<any>(null)
    const [visible, setVisible] = useState(false)
    const [balanceOf, setMoney] = useState('0')
    const onClose = () => {
        props.cref?.current.setter(true)
        setVisible(true)
        props.cref.current.getter = setVisible
    }
    // 连接
    const onConnect = () => {
        console.log(contract)
        contract.createInit && contract.createInit()
    }
    const setl = i18n.changeLanguage
    const changeLang = (type: string) => {
        setl(type)
        setPos(type === 'zh-CN' ? '简体中文' : "English")
    }
    const bottom = window.innerWidth < 600 ? '-10px' : '-25px'
    const left = window.innerWidth < 600 ? '-25px' : ''
    useEffect(() => {
        contract.balanceOf && contract.balanceOf().then((res: any) => {
            setMoney((res / 1e18).toFixed(4))
        })
    }, [audioRef, contract])
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
    let url = null;
    // if ()
    console.log(menu.props.children)
    return (
        <>
            {/* <audio controls={true} hidden={true} loop={true} ref={audioRef}>
                <source src={require("../../utils/music.mp3").default} type="audio/mpeg" />
            </audio> */}
            <div style={{
                textAlign: 'end',
                padding: '20px 20px 0 0',
                position: 'absolute',
                left: 0,
                zIndex: 1000,
                right: 0,
            }}>
                <Space wrap align="center" style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '20px', flexWrap: 'unset' }}>
                    <div className="mobile-btn" style={{ filter: 'brightness(1.2)' }} onClick={onClose}>
                        <img src={toleft} alt="" style={{ width: '100' }} />
                    </div>
                    <div className="mobile-btn-1 mobile">
                        <img src={require('../../utils/img/gold.png').default} alt="" className="gold-img" />
                        <span style={{ color: "#fced95", marginTop: "5px" }}>{balanceOf}MWC</span>
                    </div>

                    <div className="mobile">
                        {
                            contract.defaultAccount ?
                                <div className='mobile-btn-2 connect-btn'>
                                    {contract.defaultAccount.slice(0, 6) + '...' + contract.defaultAccount.slice(-4, -1)}
                                </div>
                                :
                                <img src={require('../../utils/img/connect.png').default} className="connect-btn" alt="" onClick={onConnect} />
                        }
                    </div>
                    <div style={{ position: 'relative', display: 'flex' }}>
                        <div className="blance brower-btn">
                            <img src={require('../../utils/img/gold.png').default} alt="" className="gold-img" />
                            <span style={{ color: "#fced95" }}>{balanceOf}MWC</span>
                        </div>
                        <div className="brower-btn">
                            {
                                contract.defaultAccount ?
                                    <div className='blance-1 connect-btn'>
                                        {contract.defaultAccount.slice(0, 6) + '...' + contract.defaultAccount.slice(-4, -1)}
                                    </div>
                                    :
                                    <img src={require('../../utils/img/connect.png').default} onClick={onConnect} style={{ width: '155px', height: '45px', marginLeft: '15px', marginRight: '5px', cursor: "pointer" }} className="connect-btn brower-btn" alt="" />
                            }
                        </div>
                        <Space direction="vertical" align="center">
                            <div className="brower-btn">
                                <Dropdown overlay={menu} placement="bottomCenter" overlayStyle={{ fontSize: '0.8em !impor' }}>
                                    <Button size="large" type="text" style={{ color: '#fff', fontSize: '0.8em' }}>
                                        <img src={earthPng} style={{ width: '25px', height: '25px', marginRight: '5px', marginTop: '2px' }} alt="" />
                                        {pos}
                                    </Button>
                                </Dropdown>
                            </div>
                        </Space>
                    </div>
                </Space>
            </div >
        </>
    )
}
export default Head