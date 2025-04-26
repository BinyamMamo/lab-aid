import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ResistorTool from './features/ResistorTool';
import ICFinder from './features/ICFinder';
import Calculators from './features/Calculators';
import Datasheets from './features/Datasheets';
import Tutorials from './features/Tutorials';
import './index.css'

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="max-w-md mx-auto pb-16">
          <Routes>
            <Route path="/" element={<ResistorTool />} />
            <Route path="/ic-finder" element={<ICFinder />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/datasheets" element={<Datasheets />} />
            <Route path="/tutorials" element={<Tutorials />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

