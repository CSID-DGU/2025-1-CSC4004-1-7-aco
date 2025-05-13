import React from "react";

function ConfirmModal({ onConfirm, onCancel }) {
    return (
        <div className="modal-bg">
            <div className="modal-content" style={{ minWidth: 350, minHeight: 150, maxWidth: 400 }}>
                <div style={{ fontSize: 20, marginBottom: 32, textAlign: "center" }}>
                    정말로 삭제하시겠습니까?
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                    <button onClick={onCancel}>아니오</button>
                    <button className="save-btn" onClick={onConfirm}>네</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
