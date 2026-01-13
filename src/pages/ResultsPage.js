/* TODO
   - Copy structures and sequences to clipboard
   - Display figures of structures (stretch goal)
*/

import { useLocation, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import ResultsTable from '../components/ResultsTable';
import DownloadButtons from '../components/DownloadButtons';
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

    const { s, f } = data || {};
    
    const showSAMFEO = Boolean(s);
    const showFastDesign = Boolean(f);

    const headers = [
        { label: 'Metric', className: 'font-bold uppercase'},
        ...(showSAMFEO
            ? [{ label: 'SAMFEO', className: 'text-center text-lg font-bold'}]
            : []),
        ...(showFastDesign
            ? [{ label: 'SAMFEO++', className: 'text-center text-lg font-bold'}]
            : [])
    ];

    const rows = [
        [
            { value: 'Target Structure', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.structure, className: 'text-center mono text-emerald font-bold'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.structure, className: 'text-center mono text-emerald font-bold'}]
                : [])
        ],
        [
            { value: 'Best Prob.', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.prob_val, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.prob_val, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'Sequence w/ Best Prob.', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.prob_seq, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.prob_seq, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'Best NED', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.ned_val, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.ned_val, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'Sequence w/ Best NED', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.ned_seq, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.ned_seq, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'Best Structural Distance', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.dist_val, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.dist_val, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'Sequence w/ Best Distance', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.dist_seq, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.dist_seq, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: '# of MFE Design', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.mfe, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.mfe, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: '# of uMFE Design', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.umfe, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.umfe, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'MFE Design Example', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.mfe_sample, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.mfe_sample, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'uMFE Design Example', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.umfe_sample, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.umfe_sample, className: 'text-center mono'}]
                : [])
        ],
        [
            { value: 'Time (seconds)', className: 'font-semibold text-slate'},
            ...(showSAMFEO
                ? [{ value: s.time, className: 'text-center mono'}]
                : []),
            ...(showFastDesign
                ? [{ value: f.time, className: 'text-center mono'}]
                : [])
        ]
    ];

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

                <Button variant="secondary" type="button" onClick={goBack}>&larr; Go back</Button>
            </div>
        </Body>
    )
}