import styled from "@emotion/styled";
import { Layout, Menu } from "antd";
import { layoutColors } from "src/utils/colors";

export const StyledLayout = styled(Layout)`
  background: ${layoutColors.background};
  margin: 0px;
  min-height: 100vh;
`;

export const StyledHeader = styled(Layout.Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: inherit;

  a {
    display: flex;
    justify-content: center; 
    align-items: center;
  }

  .mobile-logo {
    height: 25px;
    width: 25px;
  }

  .logo {
    height: 50px;
    width: 50px;
  }
`;

export const StyledContent = styled(Layout.Content)`
  overflow: auto;
  background: inherit;
`;

export const StyledMenu = styled(Menu)`
  background: inherit;
  flex: auto;
  min-width: 0;
  justify-content: right;
`;