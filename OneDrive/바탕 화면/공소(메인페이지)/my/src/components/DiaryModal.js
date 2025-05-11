import React from "react";

function DiaryModal({ value, onChange, onClose, onSaveClick, onDelete, isToday }) {
    return (
        <div className="modal-bg">
            <div className="modal-content">
                <button
                    style={{ position: "absolute", top: 16, right: 24, background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
                    onClick={onClose}
                >×</button>
                <textarea
                    className="diary-lines"
                    style={{ height: 350, fontSize: 13.5 }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="오늘의 일기를 작성해보세요."
                    readOnly={!isToday}
                />
                {isToday && (
                    <div className="button-group" style={{ justifyContent: "flex-end" }}>
                        <button onClick={onDelete}>전체 삭제하기</button>
                        <button className="save-btn" onClick={onSaveClick}>저장하기</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DiaryModal;