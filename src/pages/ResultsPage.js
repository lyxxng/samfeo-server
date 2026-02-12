/* TODO
   - Copy structures and sequences to clipboard
   - Display figures of structures (stretch goal)
        - [x] Base pairing probability
        - Secondary structure
*/

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import ResultsTable from '../components/ResultsTable';
import DownloadButtons from '../components/DownloadButtons';
import Divider from '../components/Divider';
import RNALinearPlot from '../components/RNALinearPlot';
import { METRICS } from '../constants/resultsMetrics';
import { buildTableHeaders, buildTableRows } from '../utils/tableBuilder';

export default function ResultsPage() {
    const location = useLocation();
    const data = location.state;
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const goBack = () => {
        navigate('/');
    };

    if (!data) {
        return <p>No results found.</p>;
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

                <Divider />

                <h3>Base Pairing Probability Visualization</h3>
                <RNALinearPlot
                    samfeoData={s}
                    fastDesignData={f}
                />

                <Button variant="secondary" type="button" onClick={goBack}>
                    &larr; Go back
                </Button>
            </div>
        </Body>
    );
}