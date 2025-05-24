import React from "react";
import styled from "styled-components";
import DiaryEditor from "./DiaryEditor";

const ModalBg = styled.div`
  position: fixed;
  z-index: 2000;
  left: 0; top: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.18);
  display: flex; align-items: center; justify-content: center;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  width: 900px;
  min-height: 600px;
  padding: 48px 40px 32px 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CloseBtn = styled.button`
  position: absolute; top: 24px; right: 24px;
  background: none; border: none; font-size: 28px; cursor: pointer;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    width: 100%;
    margin-top: 24px;
`;

const AnalyzeButton = styled.button`
    padding: 10px 24px;
    border-radius: 20px;
    background: #0089ed;
    color: #fff;
    border: none;
    font-size: 16px;
    cursor: pointer;
`;

const DeleteButton = styled.button`
    padding: 10px 24px;
    border-radius: 20px;
    background: #fff;
    color: #222;
    border: 1px solid #222;
    font-size: 16px;
    cursor: pointer;
`;

const SaveButton = styled.button`
    padding: 10px 24px;
    border-radius: 20px;
    background: #fff;
    color: #222;
    border: 1.5px solid #222;
    font-size: 16px;
    cursor: pointer;
    margin-left: 8px;
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export default function DiaryModal({
  value,
  onChange,
  onClose,
  isToday,
  onAnalyze,
  isAnalyzing,
  onDelete,
  showDelete = false,
  onSave
}) {
  return (
    <ModalBg>
      <ModalBox>
        <CloseBtn onClick={onClose}>×</CloseBtn>
        <DiaryEditor
          value={value}
          onChange={onChange}
          isToday={isToday}
          smallFont={false}
          modal
        />
        <ButtonContainer>
          <AnalyzeButton onClick={onAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? "분석 중..." : "일기 분석 확인"}
          </AnalyzeButton>
          <SaveButton onClick={onSave} disabled={!isToday}>
            저장하기
          </SaveButton>
          <DeleteButton onClick={onDelete} disabled={!showDelete}>
            삭제하기
          </DeleteButton>
        </ButtonContainer>
      </ModalBox>
    </ModalBg>
  );
}