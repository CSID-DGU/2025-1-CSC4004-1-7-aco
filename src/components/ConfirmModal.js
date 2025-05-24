import React from "react";
import styled from "styled-components";

const ModalBg = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.10);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ModalContent = styled.div`
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    min-width: 350px;
    min-height: 150px;
    max-width: 400px;
    padding: 32px 24px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (max-width: 600px) {
        min-width: 80vw;
        max-width: 95vw;
        padding: 20px 8px 16px 8px;
    }
`;

const ModalMessage = styled.div`
    font-size: 20px;
    margin-bottom: 32px;
    text-align: center;
    word-break: keep-all;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: center;
    gap: 16px;
`;

const RoundButton = styled.button`
    min-width: 80px;
    height: 40px;
    background: #fff;
    border: 2px solid #0089ED;
    border-radius: 100px;
    font-size: 16px;
    font-weight: 600;
    color: #0089ED;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.2s;
    &:hover {
        background: #0089ED;
        color: #fff;
        transform: scale(1.07);
    }
    @media (max-width: 600px) {
        min-width: 60px;
        font-size: 14px;
        height: 36px;
    }
`;

function ConfirmModal({ onConfirm, onCancel, message }) {
    return (
        <ModalBg>
            <ModalContent>
                <ModalMessage>{message || "정말로 삭제하시겠습니까?"}</ModalMessage>
                <ButtonRow>
                    <RoundButton onClick={onCancel}>아니오</RoundButton>
                    <RoundButton onClick={onConfirm}>네</RoundButton>
                </ButtonRow>
            </ModalContent>
        </ModalBg>
    );
}

export default ConfirmModal;
