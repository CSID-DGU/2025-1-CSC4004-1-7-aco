import React from "react";

function AnalysisModal({ result, onClose, isLoading }) {
    return (
        <div className="modal-bg">
            <div className="modal-content" style={{ minWidth: 400, minHeight: 200, maxWidth: 500 }}>
                <button
                    style={{ position: "absolute", top: 16, right: 24, background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
                    onClick={onClose}
                >×</button>
                <div style={{ fontSize: 22, textAlign: "center", marginTop: 40 }}>
                    {isLoading ? "분석 중..." : result}
                </div>
            </div>
        </div>
    );
}

export default AnalysisModal;
