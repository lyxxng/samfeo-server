import Container from 'react-bootstrap/Container';
import Header from './components/Header';
import InputPage from './pages/InputPage';

export default function App() {
  return (
    <Container fluid className="App">
      <Header />
      <Container>
        <InputPage />
      </Container>
    </Container>
  );
}