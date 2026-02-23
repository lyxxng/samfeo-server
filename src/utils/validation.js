// Validation utilities for form inputs

export const validateStructure = (structure) => {
    if (!structure) {
        return 'Specify a dot-bracket structure.';
    }
    if (structure.length <= 5) {
        return 'Structure must be longer than 5 characters.';
    }
    if (!/^[().]+$/.test(structure)) {
        return 'Invalid dot-bracket structure.';
    }
    // Check balanced parentheses
    let depth = 0;
    for (const char of structure) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (depth < 0) return 'Invalid dot-bracket structure.';
    }
    if (depth !== 0) return 'Invalid dot-bracket structure.';

    return null;
};

export const validateNumericRange = (value, min, max, fieldName) => {
    if (!value) {
        return `Specify a ${fieldName}.`;
    }
    if (!/^\d+$/.test(value)) {
        return 'Must be a numerical value.';
    }
    const numValue = Number(value);
    if (numValue < min || numValue > max) {
        return `${fieldName} must be between ${min} and ${max}.`;
    }
    return null;
};

export const validateSAMFEOInputs = (temperature, queue, step) => {
    const errors = {};

    const tempError = validateNumericRange(temperature, 0.1, 10, 'Sampling temperature');
    if (tempError) errors.temperature = tempError;

    const queueError = validateNumericRange(queue, 1, 10, 'Frontier size');
    if (queueError) errors.queue = queueError;

    const stepError = validateNumericRange(step, 100, 10000, 'Step value');
    if (stepError) errors.step = stepError;

    return errors;
};

export const validateFastDesignInputs = (motifstep, poststep, prune) => {
    const errors = {};

    const motifstepError = validateNumericRange(motifstep, 100, 10000, 'Step value');
    if (motifstepError) errors.motifstep = motifstepError;

    const poststepError = validateNumericRange(poststep, 0, 2500, 'Step value');
    if (poststepError) errors.poststep = poststepError;

    const pruneError = validateNumericRange(prune, 10, 100, 'Beam size');
    if (pruneError) errors.prune = pruneError;

    return errors;
};