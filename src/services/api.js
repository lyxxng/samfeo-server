// API service for making backend requests

const API_URL = process.env.REACT_APP_API_URL;

const handleResponse = async (res) => {
    const contentType = res.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) {
            const error = new Error(data.error || 'Unknown error');
            error.status = res.status;
            throw error;
        }
        return data;
    } else {
        const error = new Error('Server error');
        error.status = res.status;
        throw error;
    }
};

// Submit SAMFEO job and return log_id for polling
export const submitSAMFEO = async (structure, temperature, queue, step, object) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            structure,
            temperature,
            queue,
            step,
            object
        })
    };

    const res = await fetch(`${API_URL}/samfeo_submit`, requestOptions);
    return await handleResponse(res);
}

// Submit SAMFEO++ job and return log_id for polling
export const submitFastDesign = async (structure, motifstep, poststep, prune, path) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            structure,
            step: motifstep,
            poststep,
            k_prune: prune,
            motif_path: path
        })
    };
    const res = await fetch(`${API_URL}/fastdesign_submit`, requestOptions);
    return await handleResponse(res);
};

// Poll logs for a specific job
export const pollLogs = async (logId, fromLine = 0) => {
    const res = await fetch(`${API_URL}/logs/${logId}?from=${fromLine}`);
    return await handleResponse(res);
};

// Poll status for a specific job
export const pollStatus = async (logId) => {
    const res = await fetch(`${API_URL}/status/${logId}`);
    return await handleResponse(res);
};

// SAMFEO & SAMFEO++ errors
export const handleAPIError = (err) => {
    if (err.status === 408) {
        return { submit: "Request timed out." };
    } else if (err.status === 400) {
        return { structure: "Invalid dot-bracket structure." };
    } else if (err.status === 504) {
        return { submit: "Server timeout." };
    } else {
        return { submit: "An error occurred while processing your request. Please try again." };
    }
};

// Fetch a single RNA plot
const fetchRNAPlot = async (structure, sequence) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            structure,
            sequence
        })
    };
    const res = await fetch(`${API_URL}/rna_plot`, requestOptions);
    const data = await handleResponse(res);
    return JSON.parse(data.plotly_data);
};

// Fetch all RNA plots for a given program's data
export const fetchAllRNAPlots = async (programData, sequenceKeys) => {
    const plots = {};
    for (const seqKey of sequenceKeys) {
        const sequence = programData[seqKey];
        if (sequence) {
            try {
                plots[seqKey] = await fetchRNAPlot(programData.structure, sequence);
            } catch (err) {
                console.error(`Error fetching plot for ${seqKey}:`, err);
            }
        }
    }
    return plots;
};