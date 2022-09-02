import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { Component, useContext, useEffect, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { IntroductionTextDto, AlertLevelDto, ApiResponse, SecurityUser, AlertDto } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { GlobalContext } from "../../utils/GlobalState";
import { isAdmin, notify, useNotify } from "../../utils/Helpers";
import { LoadingSymbol } from "../Shared/LoadingSymbol";

export default function IntroText() {

    let gs = useContext(GlobalContext);
    
    const {isLoading, data, error} = useQuery<ApiResponse<IntroductionTextDto>, any>(["introText"], async () => {
            return await apiServiceInstance.get<IntroductionTextDto>("aboutme/introtext");
    }, {onSuccess: (data) => {
        if (data?.alerts) {
            gs.addAlerts(data.alerts);
        }
    }});
    
    return(
        <GlobalContext.Consumer>
            {value =>
                <Col lg="10" className="introduction-text border-bottom border-3 border-secondary mt-lg-5 mt-3 mb-3 mb-lg-5 pb-3">
                    {isLoading && (
                        <LoadingSymbol />
                    )}
                    {data && data.data && (
                        <IntroTextComponent model={data.data} />
                    )}
                    {error && (
                        <p>{error.message}</p>
                    )}
                </Col>
        }
        </GlobalContext.Consumer>
    )
}

type Props = {
    model: IntroductionTextDto
}

function IntroTextComponent(props: Props) {

    return(
        <GlobalContext.Consumer>
            {value => 
                <>
                {isAdmin(value.currentUser) && (
                    <AdminMode model={props.model} />
                )}
                {!isAdmin(value.currentUser) && (
                    <ReadMode model={props.model} />
                )}
                </>
            }
        </GlobalContext.Consumer>
    )
}

function AdminMode(props: Props) {
    const {model} = props;
    const [updatedText, setUpdatedText] = useState(model?.text);
    const queryClient = useQueryClient();
    const gs = useContext(GlobalContext);

    const mutation = useMutation(async (text: string) => {
            return await apiServiceInstance.post<string, IntroductionTextDto>("aboutme/introtext", text);
        }, 
        {   
            onSuccess: async (_) => {
                await queryClient.invalidateQueries(["introText"]);
            },
            onSettled: (result) => {
                if (result){
                    gs.addAlerts(result.alerts);
                }
            }
        }
    );

    const onSubmit = async () => {
        await mutation.mutateAsync(updatedText);
    }

    return (
        <GlobalContext.Consumer>
            {value =>
                <Form onSubmit={() => onSubmit()}>
                    <Form.Group>
                        <Form.Label>Introduction text</Form.Label>
                        <Form.Control as="textarea" rows={20} defaultValue={model?.text} onChange={(e) => setUpdatedText(e.currentTarget.value)}></Form.Control>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-3" >
                        Save
                    </Button>
                </Form>
            }
        </GlobalContext.Consumer>
    )
}

function ReadMode(props: Props) {

    return (
        <>
            {props.model.text && (
                props.model.text.split('\n').map((line, i) => {
                    return (
                        <p key={i}>{line}</p>
                    )
                })
            )}
        </>
    )
}