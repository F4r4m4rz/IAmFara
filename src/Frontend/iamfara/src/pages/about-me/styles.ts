import styled from "@emotion/styled";
import { Col, Row } from "antd";
import { TextPane } from "src/components/text-pane/TextPane";

export const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 100px;
`;

export const StyledRow = styled(Row)`
   @media (max-width: 1600px) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const StyledColumn = styled(Col)`
  min-width: 800px;
  background: red;

  @media (min-width: 768px) {
    width: auto;
    max-width: 100%;
  }
`;

export const StyledTextPane = styled(TextPane)`
  margin: 20px 20px 0 20px;
`;