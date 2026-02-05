/* TODO
   - Copy structures and sequences to clipboard
   - Display figures of structures (stretch goal)
*/

import { useLocation, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import ResultsTable from '../components/ResultsTable';
import DownloadButtons from '../components/DownloadButtons';
import NoResults from '../components/NoResults';
import { METRICS } from '../constants/resultsMetrics';
import { buildTableHeaders, buildTableRows } from '../utils/tableBuilder';

export default function ResultsPage() {
    const location = useLocation();
    const data = location.state;
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/');
    };

    if (!data) {
        return <NoResults />;
    }

    const { s, f } = data;
    
    const showSAMFEO = Boolean(s);
    const showFastDesign = Boolean(f);

    const headers = buildTableHeaders(showSAMFEO, showFastDesign);
    const rows = buildTableRows(METRICS, s, f);

    return (
        <Body>
            <div className='results-card'>
                <h3>RNA Design Results</h3>

                <ResultsTable
                    headerClass={'method-header'}
                    headers={headers}
                    content={rows}
                />
                
                <DownloadButtons
                    samfeo={s}
                    fastDesign={f}
                />

                <Button variant="secondary" type="button" onClick={goBack}>
                    &larr; Go back
                </Button>
            </div>
        </Body>
    );
}