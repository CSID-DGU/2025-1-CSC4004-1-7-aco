import React, { useState } from "react";
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
  padding: 40px 32px 32px 32px;
  min-width: 380px;
  min-height: 260px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
  width: 100%;
  justify-content: flex-start;
`;

const Label = styled.label`
  font-size: 17px;
  font-weight: 500;
  min-width: 90px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  background: #f3f6fa;
  border-radius: 20px;
  padding: 4px 10px;
  gap: 8px;
`;

const StepBtn = styled.button`
  width: 28px; height: 28px;
  border-radius: 50%;
  border: none;
  background: #e0e7ef;
  color: #0089ED;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #b3d8fd; }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  input { display: none; }
  span {
    position: absolute; cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #e0e7ef;
    border-radius: 28px;
    transition: .3s;
  }
  span:before {
    position: absolute; content: "";
    height: 22px; width: 22px; left: 3px; bottom: 3px;
    background: #fff; border-radius: 50%;
    transition: .3s;
  }
  input:checked + span {
    background: #0089ED;
  }
  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const TimeInput = styled.input`
  font-size: 16px;
  border: 1.5px solid #e0e7ef;
  border-radius: 12px;
  padding: 6px 16px;
  background: #f3f6fa;
  outline: none;
  width: 120px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 28px;
`;

const Button = styled.button`
  min-width: 100px;
  height: 44px;
  background: #fff;
  border: 2px solid #0089ED;
  border-radius: 100px;
  font-size: 17px;
  font-weight: 600;
  color: #0089ED;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  &:hover {
    background: #0089ED;
    color: #fff;
    transform: scale(1.07);
  }
`;

function AnalysisInputModal({ open, onConfirm, onCancel, defaultValue }) {
  const [mealCount, setMealCount] = useState(defaultValue?.mealCount || 0);
  const [outing, setOuting] = useState(defaultValue?.outing || false);
  const [wakeUpTime, setWakeUpTime] = useState(defaultValue?.wakeUpTime || "07:00");

  if (!open) return null;

  return (
    <ModalBg>
      <ModalBox>
        <Title>최종 저장 정보 입력</Title>
        <InputRow>
          <Label>
            <span role="img" aria-label="식사">🍚</span> 식사 횟수
          </Label>
          <Stepper>
            <StepBtn onClick={() => setMealCount(Math.max(0, mealCount - 1))}>-</StepBtn>
            <span style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{mealCount}</span>
            <StepBtn onClick={() => setMealCount(Math.min(10, mealCount + 1))}>+</StepBtn>
          </Stepper>
        </InputRow>
        <InputRow>
          <Label>
            <span role="img" aria-label="외출">🚶‍♂️</span> 외출 여부
          </Label>
          <ToggleSwitch>
            <input
              type="checkbox"
              checked={outing}
              onChange={e => setOuting(e.target.checked)}
            />
            <span />
          </ToggleSwitch>
          <span style={{ marginLeft: 10, fontWeight: 500, color: outing ? '#0089ED' : '#bbb' }}>
            {outing ? '외출함' : '외출 안함'}
          </span>
        </InputRow>
        <InputRow>
          <Label>
            <span role="img" aria-label="기상">⏰</span> 기상 시간
          </Label>
          <TimeInput
            type="time"
            value={wakeUpTime}
            onChange={e => setWakeUpTime(e.target.value)}
          />
        </InputRow>
        <ButtonRow>
          <Button onClick={onCancel}>취소</Button>
          <Button onClick={() => onConfirm({ mealCount, outing, wakeUpTime })}>확인</Button>
        </ButtonRow>
      </ModalBox>
    </ModalBg>
  );
}

export default AnalysisInputModal; 