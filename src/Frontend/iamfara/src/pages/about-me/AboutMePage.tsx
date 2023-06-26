import { StyledColumn, StyledDiv, StyledRow, StyledTextPane } from './styles';

export function AboutMePage() {
  return (
    <StyledDiv>
      <StyledRow>
        <StyledColumn>
          <StyledTextPane growOnHover={true}>
            <p>This is for introduction</p>
          </StyledTextPane>
        </StyledColumn>
        <StyledColumn>
          <StyledTextPane growOnHover={true}>
            <p>This is for Skills</p>
          </StyledTextPane>
          <StyledTextPane growOnHover={true}>
            <p>This is for Interests</p>
          </StyledTextPane>
        </StyledColumn>
      </StyledRow>
    </StyledDiv>
  );
}
