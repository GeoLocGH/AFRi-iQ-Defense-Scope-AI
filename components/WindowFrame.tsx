import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';

interface WindowFrameProps {
    id?: string;
    title: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
    headerRight?: React.ReactNode;
}

// Global z-index counter for detached windows
let globalZIndex = 10;

export const WindowFrame: React.FC<WindowFrameProps> = ({ id, title, children, className = "", onClose, headerRight }) => {
    const [minimized, setMinimized] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const [closed, setClosed] = useState(false);
    
    const [isDetached, setIsDetached] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState<{ width: string | number, height: string | number }>({ width: '100%', height: 'auto' });
    const [zIndex, setZIndex] = useState(1);

    const rndRef = useRef<any>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        if (id) {
            const savedState = localStorage.getItem(`window-state-v2-${id}`);
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (parsed.minimized !== undefined) setMinimized(parsed.minimized);
                    if (parsed.maximized !== undefined) setMaximized(parsed.maximized);
                    if (parsed.closed !== undefined) setClosed(parsed.closed);
                    if (parsed.isDetached !== undefined) setIsDetached(parsed.isDetached);
                    if (parsed.position) setPosition(parsed.position);
                    if (parsed.size) setSize(parsed.size);
                    if (parsed.zIndex) {
                        setZIndex(parsed.zIndex);
                        if (parsed.zIndex >= globalZIndex) {
                            globalZIndex = parsed.zIndex + 1;
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse window state", e);
                }
            }
        }
    }, [id]);

    // Save state to localStorage when it changes
    useEffect(() => {
        if (id) {
            const stateToSave = {
                minimized,
                maximized,
                closed,
                isDetached,
                position,
                size,
                zIndex
            };
            localStorage.setItem(`window-state-v2-${id}`, JSON.stringify(stateToSave));
        }
    }, [id, minimized, maximized, closed, isDetached, position, size, zIndex]);

    const bringToFront = () => {
        if (isDetached || maximized) {
            globalZIndex += 1;
            setZIndex(globalZIndex);
        }
    };

    const handleRestoreToGrid = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDetached(false);
        setPosition({ x: 0, y: 0 });
        setSize({ width: '100%', height: 'auto' });
        setMaximized(false);
        setMinimized(false);
        // Force a small delay to ensure Rnd component updates its internal state
        setTimeout(() => {
            if (rndRef.current) {
                rndRef.current.updatePosition({ x: 0, y: 0 });
                rndRef.current.updateSize({ width: '100%', height: 'auto' });
            }
        }, 0);
    };

    if (closed) return null;

    // Base classes for the card
    const baseClasses = "bg-gray-900/85 backdrop-blur-md rounded-xl shadow-2xl flex flex-col transition-colors duration-300 border border-gray-700/50";
    // Fixed position for maximized state to overlay everything
    const maximizedClasses = "fixed inset-0 z-50 w-screen h-screen m-0 rounded-none bg-gray-900/95 backdrop-blur-lg";
    
    const isFixed = maximized || isDetached;

    const windowContent = (
        <Rnd
            ref={rndRef}
            style={{ 
                position: isFixed ? 'fixed' : 'relative', 
                zIndex: maximized ? 1000 : (isDetached ? zIndex : 1),
            }}
            className={`${baseClasses} ${maximized ? maximizedClasses : className} ${!isFixed ? 'rnd-in-grid' : ''}`}
            position={maximized ? { x: 0, y: 0 } : (!isDetached ? { x: 0, y: 0 } : position)}
            size={maximized ? { width: '100vw', height: '100vh' } : (minimized ? { width: isDetached ? size.width : '100%', height: 'auto' } : (!isDetached ? { width: '100%', height: 'auto' } : size))}
            onDragStart={(e, d) => {
                bringToFront();
                if (!maximized && !isDetached && rndRef.current?.resizableElement?.current) {
                    const rect = rndRef.current.resizableElement.current.getBoundingClientRect();
                    setPosition({ x: rect.left, y: rect.top });
                    setSize({ width: rect.width, height: rect.height });
                    setIsDetached(true);
                }
            }}
            onDragStop={(e, d) => {
                if (!maximized) {
                    setPosition({ x: d.x, y: d.y });
                }
            }}
            onResizeStart={() => {
                bringToFront();
                if (!maximized && !isDetached && rndRef.current?.resizableElement?.current) {
                    const rect = rndRef.current.resizableElement.current.getBoundingClientRect();
                    setPosition({ x: rect.left, y: rect.top });
                    setSize({ width: rect.width, height: rect.height });
                    setIsDetached(true);
                }
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                if (!maximized) {
                    setSize({ width: ref.style.width, height: ref.style.height });
                    setPosition(position);
                }
            }}
            onMouseDownCapture={bringToFront}
            disableDragging={maximized}
            enableResizing={!maximized && !minimized}
            dragHandleClassName="window-drag-handle"
            bounds="window"
        >
            {/* Header Bar */}
            <div 
                className={`window-drag-handle flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750 select-none ${maximized ? '' : 'cursor-move'} ${minimized ? 'rounded-lg' : 'rounded-t-lg'}`}
                onDoubleClick={() => setMaximized(!maximized)}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Traffic light style controls for a clean look */}
                    <div className="flex items-center gap-1.5 mr-2">
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setClosed(true);
                                if (onClose) onClose();
                            }} 
                            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors focus:outline-none" 
                            title="Close"
                            aria-label="Close"
                        />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setMinimized(!minimized);
                            }} 
                            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors focus:outline-none" 
                            title={minimized ? "Expand" : "Minimize"}
                            aria-label={minimized ? "Expand" : "Minimize"}
                        />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setMaximized(!maximized);
                            }} 
                            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors focus:outline-none" 
                            title={maximized ? "Restore" : "Maximize"}
                            aria-label={maximized ? "Restore" : "Maximize"}
                        />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wide text-gray-200 truncate flex items-center gap-2">
                        {title}
                    </div>
                </div>
                <div className="flex items-center pl-2 gap-2">
                    {isDetached && !maximized && (
                        <button
                            onClick={handleRestoreToGrid}
                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                            title="Restore to Grid"
                        >
                            Snap
                        </button>
                    )}
                    {headerRight}
                </div>
            </div>
            
            {/* Content Area */}
            {!minimized && (
                <div className={`flex-grow overflow-auto ${maximized ? 'p-6' : ''}`}>
                    {children}
                </div>
            )}
        </Rnd>
    );

    return windowContent;
}