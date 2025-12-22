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
import Monospace from '../components/Monospace';

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

    const { samfeo, fastDesign } = data || {};
    
    const showSAMFEO = Boolean(samfeo);
    const showFastDesign = Boolean(fastDesign);

    const emptyCell = <span style={{ opacity: 0.4 }}>—</span>;

    // Table headers
    const headers = ["Metric"];
    if (showSAMFEO) headers.push("SAMFEO Results");
    if (showFastDesign) headers.push("SAMFEO++ Results");

    // Content for all rows
    const rowDefs = [
        {
            label: "Target structure",
            samfeo: s => s.structure,
            fast: f => f.structure
        },
        {
            label: "RNA sequence (best objective value)",
            samfeo: s => s.rna,
            fast: null
        },
        {
            label: "Normalized ensemble defect (NED)",
            samfeo: s => s.ned_val,
            fast: f => f.ned_val
        },
        {
            label: "Best NED sequence",
            samfeo: s => s.ned_seq,
            fast: f => f.ned_seq
        },
        {
            label: "Structure distance (d)",
            samfeo: s => s.dist_val,
            fast: f => f.dist_val
        },
        {
            label: "Best d sequence",
            samfeo: s => s.dist_seq,
            fast: f => f.dist_seq
        },
        {
            label: "Conditional probability (prob)",
            samfeo: null,
            fast: f => f.prob_val
        },
        {
            label: "Best prob sequence",
            samfeo: null,
            fast: f => f.prob_seq
        },
        {
            label: "# of MFE found",
            samfeo: s => s.mfe,
            fast: f => f.mfe
        },
        {
            label: "# of uMFE found",
            samfeo: s => s.umfe,
            fast: f => f.umfe
        },
        {
            label: "Time",
            samfeo: s => s.time,
            fast: f => f.time
        }
    ]

    // Create the table with an empty cell as necessary
    const tableContent = rowDefs.map(row => {
        const cells = [row.label];

        if (showSAMFEO) {
            cells.push(
            row.samfeo
                ? <Monospace>{row.samfeo(samfeo)}</Monospace>
                : emptyCell
            );
        }

        if (showFastDesign) {
            cells.push(
            row.fast
                ? <Monospace>{row.fast(fastDesign)}</Monospace>
                : emptyCell
            );
        }

        return cells;
    });

    return (
        <Body>
            <h3>Results</h3>
            <ResultsTable headers={headers} content={tableContent} />
            <Button variant="secondary" type="button" onClick={goBack}>&larr; Go back</Button>
        </Body>
    )
}