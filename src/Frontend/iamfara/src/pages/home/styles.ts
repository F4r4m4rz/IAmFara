import styled from "@emotion/styled";
import { TextPane } from "src/components/text-pane/TextPane";

export const ContainerDiv = styled.div`
  display: flex;
  justify-content: center;

  .mobile {
    margin-top: 30px;
    font-size: 12px;
    width: 300px;
  }
`;

export const WelcomeText = styled(TextPane)`
  width: 600px;
  margin-top: 100px;

  p {
    text-align: justify;
    text-justify: inter-word;
  }
`;