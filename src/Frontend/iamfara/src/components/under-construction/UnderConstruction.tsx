import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CenteredDiv, StyledDiv } from "./styles";
import { faPersonDigging } from "@fortawesome/free-solid-svg-icons";
import { useMobile } from "src/utils/mediaQueries";
import { TextPane } from "../text-pane/TextPane";

export function UnderConstruction() {
    const isMobile = useMobile();

    return (
        <CenteredDiv>
            <StyledDiv className={isMobile ? "mobile" : undefined}>
                <FontAwesomeIcon className="icon" icon={faPersonDigging} beatFade size="3x" />
                <h2>Under Construction</h2>
            </StyledDiv>
            <TextPane className={isMobile ? "mobile text-pane" : "text-pane"}>
                <p>Exciting things are in the works. I'm building something useful and cool. Stay tuned and check back again in a little while to discover what's coming your way. I can't wait to share it with you!</p>
                <p>Thank you for your patience and continued support.</p>
            </TextPane>
        </CenteredDiv>
    )
}