

import React, { useState } from 'react';
import type { UserRole } from '../types';
import { ToggleSwitch } from './ToggleSwitch';
import { useTranslation } from '../contexts/I18nContext';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPanelProps {
    port: string;
    setPort: (port: string) => void;
    userRole: UserRole;
    onRoleChange: (role: UserRole) => void;
    showGeofences: boolean;
    onShowGeofencesChange: (show: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ port, setPort, userRole, onRoleChange, showGeofences, onShowGeofencesChange }) => {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="fixed bottom-4 right-4 z-[100]">
            <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-700 transition-colors gap-4"
                >
                    <div className="flex items-center gap-2">
                        <Settings className={`w-4 h-4 text-cyan-400 ${!isCollapsed ? 'animate-spin-slow' : ''}`} />
                        <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">{t('settings.title') || 'Settings'}</span>
                    </div>
                    {isCollapsed ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="border-t border-gray-700"
                        >
                            <div className="p-4 flex flex-col gap-4 min-w-[240px]">
                                <div className="flex items-center justify-between gap-4">
                                    <label htmlFor="role-select" className="text-xs font-semibold text-gray-400 uppercase tracking-tight">{t('settings.user_role')}</label>
                                    <select 
                                        id="role-select" 
                                        value={userRole} 
                                        onChange={(e) => onRoleChange(e.target.value as UserRole)}
                                        className="bg-gray-900 text-white text-xs rounded border border-gray-700 px-2 py-1 outline-none focus:border-cyan-500 transition-colors"
                                    >
                                        <option value="Operator">{t('settings.role.operator')}</option>
                                        <option value="Admin">{t('settings.role.admin')}</option>
                                    </select>
                                </div>

                                {userRole === 'Admin' && (
                                    <div className="flex items-center justify-between gap-4">
                                        <label htmlFor="api-port" className="text-xs font-semibold text-gray-400 uppercase tracking-tight">{t('settings.api_port')}</label>
                                        <input 
                                            type="text" 
                                            id="api-port" 
                                            value={port} 
                                            onChange={(e) => setPort(e.target.value)}
                                            className="bg-gray-900 text-white text-xs rounded border border-gray-700 px-2 py-1 w-20 text-center outline-none focus:border-cyan-500 transition-colors"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-4">
                                    <label htmlFor="geofence-toggle" className="text-xs font-semibold text-gray-400 uppercase tracking-tight">{t('settings.show_geofences')}</label>
                                    <ToggleSwitch id="geofence-toggle" isEnabled={showGeofences} onToggle={() => onShowGeofencesChange(!showGeofences)} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};