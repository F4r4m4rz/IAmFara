import { useMediaQuery } from "react-responsive";

export function useMobile() {
    return useMediaQuery({query: '(max-width: 600px)'});
}