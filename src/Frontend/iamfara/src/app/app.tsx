import { Route, Routes } from 'react-router-dom';
import { LayoutShell } from 'src/components/layout-shell/LayoutShell';
import { UnderConstruction } from 'src/components/under-construction/UnderConstruction';
import { HomePage } from 'src/pages/home/HomePage';

export function App() {
  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route path="" element={<HomePage />} /><Route path="about" element={<UnderConstruction />} />
        <Route path="blog" element={<UnderConstruction />} />
        <Route path="contact" element={<UnderConstruction />} />
      </Route>
    </Routes>
  );
}

export default App;
