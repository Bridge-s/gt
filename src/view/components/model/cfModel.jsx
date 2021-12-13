import { Modal } from 'antd'
// eslint-disable-next-line import/no-anonymous-default-export
const CfModel =  (props) => {
    return (
        <>
            <Modal width="300px" centered  closable={false} visible={ props.isModalVisible } onOk={ props?.handleOk } modalRender={props.modalRender} onCancel={ props?.handleCancel }>
                { props.children }
            </Modal>
        </>
    )
}
export default CfModel