import styled from '@emotion/styled';
import { Route, Routes } from 'react-router-dom';
import { LayoutShell } from 'src/components/layout-shell/LayoutShell';
import TestComponent from 'src/components/test-component/TestComponent';

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route path="" element={<>Home page</>} />
        <Route path="Blog" element={<>Blog page</>} />
        <Route path="Test" element={<TestComponent />} />
      </Route>
    </Routes>
  );
}

export default App;
