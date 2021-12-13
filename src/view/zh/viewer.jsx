import FileViewer from 'react-file-viewer'
import { useTranslation } from 'react-i18next'

const ViewPdf = () => {
    const { t, i18n } = useTranslation()
    const l = i18n.language
    const pdf = l === 'en' ? '/DGEWhitePaper.pdf' : '/恐龙乐园.pdf'
    return (
        <a href={ pdf }></a>
    )
}
export default ViewPdf