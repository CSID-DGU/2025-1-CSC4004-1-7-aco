import React from "react";

function DiaryEditor({ value, onChange, onExpand, isToday, onSaveClick, onDelete }) {
    return (
        <div className="diary-editor-container">
            <button className="magnifier-btn" onClick={onExpand} title="확대">
                <span role="img" aria-label="돋보기">🔍</span>
            </button>
            <textarea
                className="diary-lines"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="오늘의 일기를 작성해보세요."
                readOnly={!isToday}
            />
            {isToday && (
                <div className="button-group">
                    <button onClick={onDelete}>전체 삭제하기</button>
                    <button className="save-btn" onClick={onSaveClick}>저장하기</button>
                </div>
            )}
        </div>
    );
}

export default DiaryEditor;