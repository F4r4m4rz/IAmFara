import React, { useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IntroductionTextDto } from "../../contractTypes";
import { IsUserAdmin } from "../../utils/Helpers";
import { AppState } from "../../utils/Store";
import { LoadingSymbol } from "../Shared/LoadingSymbol";

function IntroText(props: Props) {
    const [updatedText, setUpdatedText] = useState(props.introText?.text);

    return(
        <Col lg="10" className="introduction-text border-bottom border-3 border-secondary mt-lg-5 mt-3 mb-3 mb-lg-5 pb-3">
            {props.isAdmin && (
                <Form onSubmit={() => props.onSubmit(updatedText)}>
                    <Form.Group>
                        <Form.Label>Introduction text</Form.Label>
                        <Form.Control as="textarea" rows={20} defaultValue={props.introText?.text} onChange={(e) => setUpdatedText(e.currentTarget.value)}></Form.Control>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-3" >
                        Save
                    </Button>
                </Form>
            )}
            {!props.isAdmin && props.introText?.text && (
                props.introText?.text.split('\n').map((line, i) => {
                    return (
                        <p key={i}>{line}</p>
                    )
                })
            )}
            {!props.isAdmin && !props.introText && (
                <LoadingSymbol />
            )}
            {!props.isAdmin && props.introText && !props.introText.text && (
                <p>Failed to load Introduction text</p>
            )}
        </Col>
    )
}

const actions = (dispatch: Dispatch) => {
    return {
        onSubmit: (newIntroText: string) => {
            const action = {
                type: "INTROTEXT-UPDATED",
                payload: {
                    data: newIntroText
                }
            };
            dispatch(action);
        }
    }
}

export default connect(
    (state: AppState) => {
        return {
            introText: state.aboutMe.introText.data,
            isAdmin: IsUserAdmin()
        };
    }, actions
)(IntroText);

type Props = {
    introText: IntroductionTextDto,
    isAdmin: boolean,
    onSubmit: (newIntroText: string) => void
}