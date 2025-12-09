/* TODO
   - Display more info (# MFE and uMFE, NED, distance, etc.)
   - Download result file(s)
   - Copy structures and sequences to clipboard
   - Display figures of structures (stretch goal)
*/

import { useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import Header from '../components/Header';

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

    const { structure, rna, time } = data;

    return (
        <Container>
            <Header />
            <Body>
                <h3>Results</h3>
                <span>Structure: </span><pre>{structure}</pre>
                <span>RNA sequence: </span><pre>{rna}</pre>
                <span>Time: </span><pre>{time}s</pre>
                <Button variant="secondary" type="button" onClick={goBack}>&larr; Go back</Button>
            </Body>
        </Container>
    )
}