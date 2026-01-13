import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Header from './components/Header';
import InputPage from './pages/InputPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <Container fluid className="App">
      <Header />
      <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}