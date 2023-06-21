import { Route, Routes } from 'react-router-dom';
import { LayoutShell } from 'src/components/layout-shell/LayoutShell';
import { HomePage } from 'src/pages/home/HomePage';

export function App() {
  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route path="" element={<HomePage />} />
        {
        /*<Route path="about" element={<>About me page</>} />
        <Route path="blog" element={<>Blog page</>} />
        <Route path="contact" element={<>Contact me page</>} />*/
        }
      </Route>
    </Routes>
  );
}

export default App;
