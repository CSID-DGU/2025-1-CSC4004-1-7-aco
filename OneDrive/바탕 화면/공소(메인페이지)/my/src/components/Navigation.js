import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

const NavBar = styled.nav`
    width: 100vw;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    position: fixed;
    top: 0; left: 0; z-index: 100;
    border-bottom: 1px solid #eee;
`;

const NavInner = styled.div`
    width: 1440px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Left = styled.div`
    font-size: 20px;
    font-weight: 700;
    margin-left: 12px;
`;

const Center = styled.ul`
    display: flex;
    gap: 32px;
    justify-content: center;
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    list-style: none;
    margin: 0;
    padding: 0;
`;

const NavItem = styled.li`
    a {
        color: ${({ active }) => (active ? "#fff" : "#222")};
        background: ${({ active }) => (active ? "#0089ED" : "none")};
        border-radius: 20px;
        padding: 8px 24px;
        text-decoration: none;
        font-weight: ${({ active }) => (active ? 700 : 500)};
        font-size: 16px;
        transition: background 0.2s, color 0.2s;
    }
`;

const Right = styled.div`
    margin-right: 12px;
`;

const ProfileBtn = styled.button`
    background: none;
    border: none;
    font-size: 32px;
    cursor: pointer;
`;

const Navigation = () => {
    const location = useLocation();

    return (
        <NavBar>
            <NavInner>
                <Left>OOO님 환영합니다!</Left>
                <Center>
                    <NavItem active={location.pathname === '/'}>
                        <Link to="/">일기 작성</Link>
                    </NavItem>
                    <NavItem active={location.pathname === '/drawing'}>
                        <Link to="/drawing">그림 그리기</Link>
                    </NavItem>
                    <NavItem active={location.pathname === '/meditation'}>
                        <Link to="/meditation">명상</Link>
                    </NavItem>
                </Center>
                <Right>
                    <ProfileBtn>
                        <span role="img" aria-label="profile">👤</span>
                    </ProfileBtn>
                </Right>
            </NavInner>
        </NavBar>
    );
};

export default Navigation;