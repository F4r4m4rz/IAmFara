import styled from '@emotion/styled';
import TestComponent from 'src/components/test-component/TestComponent';

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  return (
    <StyledApp>
      <TestComponent />
    </StyledApp>
  );
}

export default App;
