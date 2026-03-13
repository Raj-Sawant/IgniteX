import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Workspace } from './pages/Workspace';
import { Analysis } from './pages/Analysis';
import { Datasets } from './pages/Datasets';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/datasets" element={<Datasets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
