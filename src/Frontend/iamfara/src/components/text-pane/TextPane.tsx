import styled from "@emotion/styled";

type Props = {
    growOnHover?: boolean;
}

export const TextPane = styled.div<Props>`
  background: #fafafa;
  font-family: 'Bangers', Courier, monospace;
  font-size: 18px;
  padding: 30px;
  border-radius: 30px;

  transition: ${(props) => props.growOnHover ? "transform 0.3s ease-in-out" : undefined };

  &:hover {
    transform: ${(props) => props.growOnHover ? "scale(1.1)" : undefined};
  }
`;