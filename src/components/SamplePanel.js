/*
 * Component for a flyout dropdown that selects a dot-bracket structure
 */

import { useState, useEffect, useRef } from 'react';

export default function SamplePanel({ samples, familyLabels, value, onChange }) {
    const families = Object.keys(samples);
    const [open, setOpen] = useState(false);
    const [activeFamily, setActiveFamily] = useState(null);
    const ref = useRef();

    // Find label + family for selected value
    const selected = (() => {
        for (const family of families) {
            const match = samples[family].find(s => s.value === value);
            if (match) return { family, name: match.name };
        }
        return null;
    })();

    const selectedLabel = selected
        ? `${familyLabels[selected.family]} – ${selected.name}`
        : 'Select a sample…';

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setActiveFamily(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (sampleValue) => {
        onChange(sampleValue);
        setOpen(false);
        setActiveFamily(null);
    };

    return (
        <div className="sp-row" ref={ref}>
            <span className="sp-label">Samples:</span>
            <div className="sp-wrapper">
                <button
                    type="button"
                    className={`sp-trigger${open ? ' sp-trigger--open' : ''}`}
                    onClick={() => setOpen(o => !o)}
                >
                    <span className="sp-trigger-label">{selectedLabel}</span>
                    <svg className="sp-trigger-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>

                {open && (
                    <div className="sp-menu">
                        {families.map(family => (
                            <div
                                key={family}
                                className={`sp-family${activeFamily === family ? ' sp-family--active' : ''}`}
                                onMouseEnter={() => setActiveFamily(family)}
                            >
                                <button type="button" className="sp-family-btn">
                                    {familyLabels[family]}
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </button>

                                {activeFamily === family && (
                                    <div className="sp-submenu">
                                        {samples[family].map(sample => (
                                            <button
                                                key={sample.value}
                                                type="button"
                                                className={`sp-sample-btn${value === sample.value ? ' sp-sample-btn--active' : ''}`}
                                                onClick={() => handleSelect(sample.value)}
                                            >
                                                <span className="sp-sample-name">
                                                    {sample.italic ? <em>{sample.name}</em> : sample.name}
                                                </span>
                                                <span className="sp-sample-len">{sample.len} nt</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}