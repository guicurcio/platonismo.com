import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug'; 
  message: string;
  data?: any;
}

interface LoggerContextType {
  logs: LogEntry[];
  log: (message: string, data?: any, level?: LogEntry['level']) => void;
  clearLogs: () => void;
}

/**
 * 1) Create the actual context
 */
const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

/**
 * 2) Provider component that wraps your entire app
 */
export const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Our main log function
  const log = (
    message: string,
    data?: any,
    level: LogEntry['level'] = 'info'
  ) => {
    setLogs((prev) => [
      ...prev,
      { timestamp: Date.now(), level, message, data },
    ]);
  };

  // Clear all logs (useful in dev or if logs get huge)
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <LoggerContext.Provider value={{ logs, log, clearLogs }}>
      {children}
    </LoggerContext.Provider>
  );
};

/**
 * 3) Custom hook to easily consume the Logger context
 */
export const useLogger = () => {
  const ctx = useContext(LoggerContext);
  if (!ctx) {
    throw new Error("useLogger must be used within a <LoggerProvider>");
  }
  return ctx;
};
