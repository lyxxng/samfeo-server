import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Header from './components/Header';
import InputPage from './pages/InputPage';
import ResultsPage from './pages/ResultsPage';

// Scroll to top of the page on each reroute
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    setTimeout(() => window.scrollTo(0, 0), 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Container fluid className="App">
      <Header />
      <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}