import React from "react";
import "./style.css";

export function IntroText() {

    return(
        <div className="row justify-content-center">
            <div className="introduction-text col-10 border-bottom border-3 border-secondary mt-5 mb-5 pb-3">
                <p>I am a self-learned full-stack developer with focus on .NET and react.</p>
                <p>My jurney as a developer started with developing plug-ins for engineering software such as PDMS, E3D, Tekla NavisWorks and etc. 
                    This start awakened my joy and deep interest in developing even more application with higher complexity and therfore led me into learning C# and .NET.
                    More complex applications needed more complex and user friendly user interface and this is where react came into picture as my main focus for frontend
                    development.
                </p>
                <p>It worths mentioning that I have also hands on developing fronend based on .NET technologies as Blazor or ASP.NET razor pages. I choose technologies 
                   based on project needs and infrastructure and complexity, but yet react is my own favorite when it comes to frontend and therefore this little webpage
                   is fully depended on .NET for its serverside and react for client side.
                </p>
                <p>
                    This is just a begining. This webpage is ment to be used more and more to publish my experiences and help others who are new in the business to grow
                    as fast as possible. 
                </p>
            </div>
        </div>
    )
}