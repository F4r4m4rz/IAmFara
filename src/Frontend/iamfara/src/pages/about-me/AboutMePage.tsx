import { TextPane } from "src/components/text-pane/TextPane";
import { IntroductionDiv } from "./styles";

export function AboutMePage() {
    return (
        <>
            <IntroductionDiv growOnHover={true}>
                <p>This is for introduction</p>
            </IntroductionDiv>
            <TextPane growOnHover={true}>
                <p>This is for Skills</p>
            </TextPane>
            <TextPane growOnHover={true}>
                <p>This is for Interests</p>
            </TextPane>
        </>
    )
}