import { Modal } from 'antd'
import '../../css/fight.css'
const Fight = ({ fightStatus = false, pngs }) => {
    return (
        <Modal width="100%" centered closable={ false } visible={ fightStatus } modalRender={
            () =>
                <div style={ { padding: '15px' } } className="fight">
                    <img src={ pngs.heroPng } alt="" className="fight-img" />
                    <img src={ require('../../../utils/img/vs.png').default } alt="" className="fight-img active" />
                    <img src={ pngs.poolPng } alt="" className="fight-img" />
                </div>
        }>
        </Modal >
    )
}
export default Fight