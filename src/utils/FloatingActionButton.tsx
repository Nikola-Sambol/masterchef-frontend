import { useState } from "react";

interface FABAction {
    label: string;
    icon?: React.ReactNode;
    color?: string;
    textColor?: string;
    onClick: () => void;
}

interface FABProps {
    icon?: React.ReactNode;
    actions: FABAction[];
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    color?: string;
    size?: string;
}

const FloatingActionButton: React.FC<FABProps> = ({
                                     icon = '+',
                                     actions,
                                     position = 'bottom-right',
                                     color = '#3171DE',
                                     size = '56px'
                                 }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFAB = () => setIsOpen(!isOpen);

    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
    };

    return (
        <div className={`fixed z-50 ${positionClasses[position]}`}>
            {/* Glavni gumb */}
            <button
                onClick={toggleFAB}
                className="flex items-center justify-center rounded-full shadow-lg text-white text-2xl transition-transform duration-300 hover:scale-110"
                style={{ backgroundColor: color, width: size, height: size }}
            >
                {icon}
            </button>

            {/* Dodatne akcije */}
            <div className={`absolute flex flex-col items-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bottom-20 right-0`}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            action.onClick();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 mb-2 rounded-full shadow-md text-sm transition-colors duration-200 hover:bg-black/10 whitespace-nowrap"
                        style={{
                            backgroundColor: action.color || '#ffffff',
                            color: action.textColor || '#000000'
                        }}
                    >
                        {action.icon && <span className="text-lg">{action.icon}</span>}
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FloatingActionButton;