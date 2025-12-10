/* TODO
   - Download result file(s)
   - Copy structures and sequences to clipboard
   - Display figures of structures (stretch goal)
   - Make prettier somehow
   - Display the design options
*/

import { useLocation, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import ResultsTable from '../components/ResultsTable';

export default function ResultsPage() {
    const location = useLocation();
    const data = location.state;
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/');
    }

    if (!data) {
        return (
            <p>No results found.</p>
        )
    }

    const { structure, rna, mfe, umfe, ned_val, ned_seq, dist_val, dist_seq, time } = data;

    return (
        <Body>
            <h3>Results</h3>
            <ResultsTable
                content={[
                    ["Target structure", <span style={{ fontFamily: 'monospace' }}>{structure}</span>],
                    ["RNA sequence", <span style={{ fontFamily: 'monospace' }}>{rna}</span>],
                    ["NED(x, y*)", <span style={{ fontFamily: 'monospace' }}>{ned_val}</span>],
                    ["Best NED sequence", <span style={{ fontFamily: 'monospace' }}>{ned_seq}</span>],
                    ["d(MFE(x), y*)", <span style={{ fontFamily: 'monospace' }}>{dist_val}</span>],
                    ["Best d sequence", <span style={{ fontFamily: 'monospace' }}>{dist_seq}</span>],
                    ["# of MFE found", <span style={{ fontFamily: 'monospace' }}>{mfe}</span>],
                    ["# of uMFE found", <span style={{ fontFamily: 'monospace' }}>{umfe}</span>]
                ]} />
            <span>Time: </span><pre>{time}s</pre>
            <Button variant="secondary" type="button" onClick={goBack}>&larr; Go back</Button>
        </Body>
    )
}