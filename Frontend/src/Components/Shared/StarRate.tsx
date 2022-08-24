import React, { useState } from 'react';

type Props = {
    numberOfActiveStars: number,
    numberOfTotalStars: number,
    editable: boolean,
    onChange?: (selectedRate: number) => void
}

export const StarRate = (props: Props) => {
    const [selectedRate, setSelectedRate] = useState(props.numberOfActiveStars)
    const [activeStarsCount, setActiveStarsCount] = useState(selectedRate);

    return (
        <>
            {!props.editable && [...Array(props.numberOfActiveStars)].map((i, j) => {
                return <Star key={j} filled={true}></Star>
            })}
            {props.editable && [...Array(props.numberOfTotalStars)].map((i, j) => {
                return <Star key={j} filled={j < activeStarsCount ? true : false} 
                    onMouseOver={() => setActiveStarsCount(j + 1)} 
                    onMouseLeave={() => setActiveStarsCount(selectedRate)}
                    onMouseDown={() => {
                        setSelectedRate(j + 1);
                        if(props.onChange){
                            props.onChange(j + 1);
                        }
                        
                    }}></Star>
            })}
        </>
    );
}

type StarProps = {
    filled: boolean,
    onMouseOver?: () => void,
    onMouseLeave?: () => void,
    onMouseDown?: () => void,
}

const Star = (props: StarProps) => {
    let variant = props.filled? "fa-solid" : "fa-regular";
    
    return (
        <>
            <i className={`${variant} fa-star`} 
                onMouseOver={props.onMouseOver} 
                onMouseLeave={props.onMouseLeave}
                onMouseDown={props.onMouseDown}></i>
        </>
    )
}