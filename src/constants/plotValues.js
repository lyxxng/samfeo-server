// Constants for the RNA linear plot

// Correct base pair probability
export const C_COLORS = [
    '#FFA000',
    '#CCCCFF',
    '#B3B3FF',
    '#9999FF',
    '#8080FF',
    '#6666FF',
    '#4D4DFF',
    '#3333FF',
    '#1A1AFF',
    '#0000FF'
];

// Incorrect base pair probability
export const I_COLORS = [
    '#FFE6E6',
    '#FFCCCC',
    '#FFB3B3',
    '#FF9999',
    '#FF8080',
    '#FF6666',
    '#FF4D4D',
    '#FF3333',
    '#FF1A1A',
    '#FF0000'
];

// Correct base pair probability labels
export const C_LABELS = ["0.0", "0.2", "0.4", "0.6", "0.8", "1.0"];

// Incorrect base pair probability labels
export const I_LABELS = ["0.01", "0.2", "0.4", "0.6", "0.8", "1.0"];

// Sequence options
export const SEQ = [
    { value: 'prob_seq', label: 'Best Probability' },
    { value: 'ned_seq', label: 'Best NED' },
    { value: 'dist_seq', label: 'Best Distance' }
];

// Program options
export const PROG = [
    { value: 'SAMFEO', label: 'SAMFEO' },
    { value: 'SAMFEO++', label: 'SAMFEO++' }
];