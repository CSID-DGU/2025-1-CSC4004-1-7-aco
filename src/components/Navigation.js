import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

const NavBar = styled.nav`
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    box-shadow: none;
    position: fixed;
    top: 0; left: 0; z-index: 100;
    border-bottom: 1px solid #eee;
    @media (max-width: 700px) {
        height: 56px;
    }
`;

const NavInner = styled.div`
    width: 1440px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 1100px) {
        width: 98vw;
    }
    @media (max-width: 700px) {
        width: 100vw;
        padding: 0 8px;
    }
`;

const Left = styled.div`
    font-size: 20px;
    font-weight: 700;
    margin-left: 12px;
    color: ${props => props.$color};
    @media (max-width: 700px) {
        font-size: 15px;
        margin-left: 4px;
    }
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
    @media (max-width: 900px) {
        gap: 12px;
        font-size: 14px;
    }
    @media (max-width: 700px) {
        gap: 4px;
        font-size: 12px;
    }
`;

const NavItem = styled.li`
    a {
        color: #fff;
        background: ${({ $active }) => ($active ? "#0089ED" : "none")};
        border-radius: 20px;
        padding: 8px 24px;
        text-decoration: none;
        font-weight: ${({ $active }) => ($active ? 700 : 500)};
        font-size: 16px;
        transition: background 0.2s, color 0.2s;
        @media (max-width: 900px) {
            padding: 6px 12px;
            font-size: 14px;
        }
        @media (max-width: 700px) {
            padding: 4px 6px;
            font-size: 12px;
        }
    }
`;

const Right = styled.div`
    margin-right: 12px;
    display: flex;
    align-items: center;
    @media (max-width: 700px) {
        margin-right: 4px;
    }
`;

const ProfileBtn = styled.button`
    background: none;
    border: none;
    font-size: 32px;
    cursor: pointer;
    color: #fff;
    @media (max-width: 700px) {
        font-size: 22px;
    }
`;

const LogoutBtn = styled.button`
    background: none;
    border: none;
    font-size: 32px;
    cursor: pointer;
    color: #fff;
    margin-left: 12px;
    transition: color 0.2s, transform 0.2s;
    &:hover {
        color: #0089ED;
        transform: scale(1.15);
    }
    @media (max-width: 700px) {
        font-size: 22px;
        margin-left: 6px;
    }
`;

const Navigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(false);
        alert('로그아웃 되었습니다!');
        // 실제 로그아웃 로직 추가 가능
    };

    // 경로에 따라 폰트 색상 결정
    const isDoctorPage = location.pathname.startsWith('/doctor');
    const leftColor = isDoctorPage ? '#000' : '#fff';

    return (
        <NavBar>
            <NavInner>
                <Left $color={leftColor}>OOO님 환영합니다!</Left>
                { !isDoctorPage && (
                  <Center>
                      <NavItem $active={location.pathname === '/mainpage'}>
                          <Link to="/mainpage">일기</Link>
                      </NavItem>
                      <NavItem $active={location.pathname === '/drawing'}>
                          <Link to="/drawing">그림</Link>
                      </NavItem>
                      <NavItem $active={location.pathname === '/meditation'}>
                          <Link to="/meditation">명상</Link>
                      </NavItem>
                  </Center>
                )}
                <Right>
                    <ProfileBtn onClick={() => {
                        const role = localStorage.getItem('role');
                        if (role === 'doctor') {
                            navigate('/mypage/doctor');
                        } else {
                            navigate('/mypage/patient');
                        }
                    }}>
                        <span role="img" aria-label="profile">👤</span>
                    </ProfileBtn>
                    <LogoutBtn onClick={() => setShowLogoutModal(true)}>
                        <span role="img" aria-label="logout">🔓</span>
                    </LogoutBtn>
                </Right>
            </NavInner>
            {showLogoutModal && (
                <ConfirmModal
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutModal(false)}
                    message="로그아웃 하시겠습니까?"
                />
            )}
        </NavBar>
    );
};

export default Navigation;