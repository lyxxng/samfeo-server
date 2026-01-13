import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack';

export default function Body({ children }) {
    return (
        <Container>
            <Stack direction="horizontal" className="Body">
                <Container className="Content">
                    {children}
                </Container>
            </Stack>
        </Container>
    );
}