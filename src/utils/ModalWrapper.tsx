// src/components/ModalWrapper.tsx
import React from "react";

interface Props {
    children: React.ReactNode;
    onClose: () => void;
}

const ModalWrapper = ({ children, onClose }: Props) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white w-[80%] max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;