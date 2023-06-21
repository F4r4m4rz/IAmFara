import styled from "@emotion/styled";

export const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;

  .icon {
    margin-right: 20px;
  }

  h2 {
    display: inline;
  }

  .mobile {
    width: 300px;
    margin-top: 30px;
    font-size: 12px;
  }
`;

export const StyledDiv = styled.div`
  margin-top: 50px;
  font-family: 'Bangers', Courier, monospace;
  font-size: 18px;
  width: 600px;

  p {
    text-align: justify;
    text-justify: inter-word;
  }
`;