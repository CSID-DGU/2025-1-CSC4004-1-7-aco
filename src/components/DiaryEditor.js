import React from "react";
import styled from "styled-components";

const Tablet = styled.div`
  position: relative;
  width: ${({ $modal }) => ($modal ? "820px" : "100%")};
  height: ${({ $modal }) => ($modal ? "500px" : "100%")};
  background: #f7f3fa;
  border-radius: 24px;
  box-shadow: none;
  padding: ${({ $modal }) => ($modal ? "48px 40px 48px 40px" : "40px 32px 80px 32px")};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
`;

const HomeDot = styled.div`
  position: absolute;
  left: 50%;
  top: -18px;
  transform: translateX(-50%);
  width: 40px;
  height: 8px;
  background: #d1c4e9;
  border-radius: 8px;
`;

const MagnifierBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
  justify-content: flex-end;
  width: 100%;
`;

const RadioLabel = styled.label`
  font-size: 14px;
  margin-right: 8px;
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 20px;
  font-weight: bold;
  border: none;
  background: transparent;
  margin-bottom: 12px;
  outline: none;
  font-family: 'Gaegu', 'Noto Sans KR', sans-serif;
  color: #333;
  &::placeholder {
    font-family: 'Gaegu', 'Noto Sans KR', sans-serif;
    color: #888;
  }
`;

const DiaryLines = styled.textarea`
  width: 100%;
  height: 320px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 23px,
    #bdbdbd 24px
  );
  border: none;
  font-size: 16px;
  line-height: 24px;
  resize: none;
  outline: none;
  background-color: transparent;
  margin-bottom: 24px;
  padding: 0;
  font-family: 'Gaegu', 'Noto Sans KR', sans-serif;
  color: #333;
  &::placeholder {
    font-family: 'Gaegu', 'Noto Sans KR', sans-serif;
    color: #888;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  position: absolute;
  bottom: 24px;
  right: 32px;
  z-index: 10;
`;

const ActionButton = styled.button`
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid #222;
  background: #fff;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.save {
    background: #0089ed;
    color: #fff;
    border: none;
  }
  &.delete {
    background: #ff4444;
    color: #fff;
    border: none;
    &:hover {
      background: #ff0000;
    }
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function DiaryEditor({
  value,
  onChange,
  onExpand,
  isToday,
  smallFont = true,
  modal = false,
  onDelete,
  showDelete = false,
}) {
  return (
    <Tablet $modal={modal}>
      <TopBar>
        <HomeDot />
        <MagnifierBtn onClick={onExpand} title="확대">
          <span role="img" aria-label="돋보기">🔍</span>
        </MagnifierBtn>
      </TopBar>
      <RadioGroup>
        <RadioLabel>
          식사 횟수
          <input
            type="number"
            min={0}
            max={10}
            value={typeof value.mealCount === 'number' ? value.mealCount : ''}
            onChange={e => {
              const v = e.target.value;
              onChange({ ...value, mealCount: v === '' ? '' : Number(v) });
            }}
            disabled={!isToday}
            style={{ width: 50, marginLeft: 8 }}
          />
        </RadioLabel>
        <RadioLabel>
          외출 여부
          <input
            type="checkbox"
            checked={!!value.outing}
            onChange={e => onChange({ ...value, outing: !value.outing })}
            disabled={!isToday}
          />
        </RadioLabel>
      </RadioGroup>
      <TitleInput
        type="text"
        placeholder="제목을 입력하세요"
        value={value.title}
        onChange={e => onChange({ ...value, title: e.target.value })}
        readOnly={!isToday}
      />
      <DiaryLines
        placeholder="오늘의 일기를 작성하세요"
        value={value.text}
        onChange={e => onChange({ ...value, text: e.target.value })}
        readOnly={!isToday}
      />
      {showDelete && isToday && (
        <ButtonGroup>
          <ActionButton className="delete" onClick={onDelete}>
            삭제하기
          </ActionButton>
        </ButtonGroup>
      )}
    </Tablet>
  );
}

export default DiaryEditor;