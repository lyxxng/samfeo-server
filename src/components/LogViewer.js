/*
 * Component for viewing log (filtered stdout) for program
 */

import { useState, useRef, useEffect } from 'react';
import { pollLogs, pollStatus } from '../services/api';

export default function LogViewer({ programName, logId, onComplete, onError }) {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('Processing');
    const [nextLine, setNextLine] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    
    const logsEndRef = useRef(null);
    const contentRef = useRef(null);
    const pollIntervalRef = useRef(null);

    // Scroll to bottom of page when component first mounts
    useEffect(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, []);

    // Auto-scroll the log content
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [logs]);

    // Poll for logs and status
    useEffect(() => {
        if (!logId || isComplete) return;

        const pollForUpdates = async () => {
            try {
                // Poll logs
                const logData = await pollLogs(logId, nextLine);
                if (logData.lines && logData.lines.length > 0) {
                    setLogs(prev => [...prev, ...logData.lines]);
                    setNextLine(logData.next);
                }

                // Poll status
                const statusData = await pollStatus(logId);
                console.log(`${programName} status:`, statusData);
                
                if (statusData.status === 'complete') {
                    setStatus('Complete');
                    setIsComplete(true);
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    if (onComplete) {
                        onComplete(statusData);
                    }
                } else if (statusData.status === 'error') {
                    setStatus('Error');
                    setIsComplete(true);
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    if (onError) {
                        onError(statusData.error);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
                setStatus('Error');
                setIsComplete(true);
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
                if (onError) {
                    onError(error.message);
                }
            }
        };

        // Start polling immediately, then every second
        pollForUpdates();
        pollIntervalRef.current = setInterval(pollForUpdates, 1000);

        // Cleanup on unmount or when complete
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [logId, nextLine, programName, onComplete, onError, isComplete]);

    return (
        <div className="log-viewer">
            <div className="log-viewer__header">
                <span>{programName} Output</span>
                {status && <span className="log-viewer__status">{status}</span>}
            </div>
            <div className="log-viewer__content" ref={contentRef}>
                {logs.length === 0 ? (
                    <div className="log-viewer__line log-viewer__line--muted">
                        Waiting for output...
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="log-viewer__line">
                            {log}
                        </div>
                    ))
                )}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
}