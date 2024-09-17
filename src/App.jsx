import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Projects from './pages/Projects';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import { AnimatePresence } from 'framer-motion';
// import { bgTheme } from './utils/themes';
import { useContext } from 'react';
import { ThemeContext } from './utils/context/ThemeContext';
function App() {
  const {darkTheme} = useContext(ThemeContext);
  return (
    <div className = {` ${darkTheme ? `bg-[#001B22]` : `bg-[#0D2438]`}  text-white`}>
      <div className='overflow-x-hidden'>
        <Navbar />
        <AnimatePresence>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects isDescriptionShowing = {true} />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>

    </div>
  );
}

export default App;
