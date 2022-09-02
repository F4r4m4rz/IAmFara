import React, { useContext, useState } from "react";
import { useLocation } from "react-router";
import "./NavBar.css";
import { AppNavItem } from "./AppNavItem";
import { Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { SecurityUser } from "../../contractTypes";
import { apiServiceInstance } from "../../utils/apiService";
import { GlobalContext } from "../../utils/GlobalState";

type NavListProps = {
    collapsed: boolean;
}

const items = [
    {title: "About me", href: "/"},
    {title: "Protofolio", href: "/protofolio"},
    {title: "Contact", href: "/contact"},
    {title: "Gallery", href: "/gallery"},
]

const AppNavList = (props: NavListProps) => {
    const {pathname} = useLocation();
    const activeItem = items.findIndex(i=>i.href.toLowerCase()===pathname.toLowerCase());

    const queryClient = useQueryClient();

    const mutation = useMutation(["logout"], async () => {
        return await apiServiceInstance.get<SecurityUser>("user/logout");
    }, { onSuccess: async (result) => {
        await queryClient.invalidateQueries(["authenticate"]);
        if (result.alerts){
            //globalContext.addAlerts(result.alerts);
        }
    } });
    
    const [activeItemIndex, setActiveItemIndex] = useState(activeItem ?? 0);
    
    const onClick = (index: number) => {
        setActiveItemIndex(index);
    }

    const onLogOut = () => {
        mutation.mutate();
    }
    
    return (
        <GlobalContext.Consumer>
            {value => 
                <Navbar.Collapse id="basic-navbar-nav bg-warning">   
                    <Nav className="app-nav-list ms-auto me-5 text-end">
                        {
                            items.map((item, index) => {
                                return <AppNavItem key={index} collapsed={props.collapsed} title={item.title} href={item.href} last={index === items.length - 1} active={() => activeItemIndex === index} onClick={() => onClick(index)}/>
                            })
                        }
                        <li>
                            {!value.currentUser && (
                                <Link to="/login" className="btn btn-outline-dark">Log in</Link>
                            )}
                            {value.currentUser &&(
                                <div>
                                    <p>{value.currentUser.email}</p>
                                    <Link to="#" onClick={onLogOut}>Log out</Link>
                                </div>
                            )}
                        </li>
                    </Nav>
                </Navbar.Collapse>
            }
        </GlobalContext.Consumer>
    );
}

export default AppNavList;