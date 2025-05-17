import React from "react";
import styled from "styled-components";

const ModalBg = styled.div`
  position: fixed;
  z-index: 2000;
  left: 0; top: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 48px 40px;
  min-width: 480px;
  min-height: 320px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute; top: 24px; right: 24px;
  background: none; border: none; font-size: 24px; cursor: pointer;
`;

const ResultTitle = styled.h2`
  font-size: 32px; font-weight: bold; margin-bottom: 32px;
`;

const ResultText = styled.div`
  font-size: 20px; margin-bottom: 16px;
`;

function AnalysisModal({ result, onClose }) {
    return (
        <ModalBg>
            <ModalBox>
                <CloseBtn onClick={onClose}>×</CloseBtn>
                <ResultTitle>분석 결과</ResultTitle>
                <ResultText>오늘의 감정: {result.emotion}</ResultText>
                <ResultText>{result.message}</ResultText>
            </ModalBox>
        </ModalBg>
    );
}

export default AnalysisModal;
