// Utility functions for building results table data

export const buildTableHeaders = (showSAMFEO, showFastDesign) => {
    return [
        { label: 'Metric', className: 'font-bold uppercase' },
        ...(showSAMFEO
            ? [{ label: 'SAMFEO', className: 'text-center text-lg font-bold' }]
            : []),
        ...(showFastDesign
            ? [{ label: 'SAMFEO++', className: 'text-center text-lg font-bold' }]
            : [])
    ];
};

export const buildTableRows = (metrics, samfeoData, fastDesignData) => {
    const showSAMFEO = Boolean(samfeoData);
    const showFastDesign = Boolean(fastDesignData);

    return metrics.map(metric => [
        { value: metric.label, className: 'font-semibold text-slate' },
        ...(showSAMFEO
            ? [{ value: samfeoData[metric.samfeoKey], className: metric.className }]
            : []),
        ...(showFastDesign
            ? [{ value: fastDesignData[metric.fastDesignKey], className: metric.className }]
            : [])
    ]);
};