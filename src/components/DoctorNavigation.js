import React from 'react';
import styled from 'styled-components';

const DoctorNavigation = ({ userName = "OOO", onMyPage, onLogout }) => (
  <NavBar>
    <Welcome>{userName}님 환영합니다</Welcome>
    <ButtonGroup>
      <NavButton onClick={onMyPage}>마이페이지</NavButton>
      <NavButton onClick={onLogout}>로그아웃</NavButton>
    </ButtonGroup>
  </NavBar>
);

const NavBar = styled.div`
  width: 100vw;
  height: 60px;
  background: #f7f7fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const Welcome = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #000000 !important;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const NavButton = styled.button`
  background: #0089ED;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1976d2; }
`;

export default DoctorNavigation; 