import { useReducer, useRef, useState, useEffect } from 'react'
import Web3 from 'web3'
import { App as AppClass } from './appClass'
const App = () => {
    let timer
    // const obj = useRef(null)
    const init = async () => {
        let web3Provider
        if (window.ethereum) {
            web3Provider = window.ethereum
            try {
                await window.ethereum.enable()
            } catch (error) {
                console.error("User denied account access")
            }
        } else if ("web3" in window) {
            web3Provider = window.web3.currentProvider
        } else {
            web3Provider = new Web3.providers.HttpProvider(
                "https://bsc-dataseed1.binance.org/"
            )
        }
        const _web3 = new Web3(web3Provider)
        const [ defaultAccount ] = await _web3.eth.getAccounts()
        if (defaultAccount) {
            const appClass = new AppClass(defaultAccount, _web3, _web3.version)
            dispath(appClass)
        }
    }
    // window.ethereum.on('accountsChanged', () => {
    //     if (!timer) {
    //         timer = setTimeout(() => {
    //             clearTimeout(timer)
    //             timer = null
    //             dispath('onresize')
    //         }, 1000)
    //     }
    // })
    // const [ contract, setContract ] = useState({})
    const [ contract, dispath ] = useReducer((state, action) => {
        if (!state.defaultAccount && (action && action.defaultAccount)) {
            action.createInit = init
            state = action
        }
        if (action === 'onresize') {
            state = { createInit: init }
        }
        return state
    }, { createInit: init })
    useEffect(() => {
        init()
    }, [])
    return contract
}
export default App