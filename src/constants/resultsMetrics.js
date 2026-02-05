// Configuration for results table metrics

export const METRICS = [
    {
        label: 'Target Structure',
        samfeoKey: 'structure',
        fastDesignKey: 'structure',
        className: 'text-center mono text-emerald font-bold'
    },
    {
        label: 'Best Prob.',
        samfeoKey: 'prob_val',
        fastDesignKey: 'prob_val',
        className: 'text-center mono'
    },
    {
        label: 'Sequence w/ Best Prob.',
        samfeoKey: 'prob_seq',
        fastDesignKey: 'prob_seq',
        className: 'text-center mono'
    },
    {
        label: 'Best NED',
        samfeoKey: 'ned_val',
        fastDesignKey: 'ned_val',
        className: 'text-center mono'
    },
    {
        label: 'Sequence w/ Best NED',
        samfeoKey: 'ned_seq',
        fastDesignKey: 'ned_seq',
        className: 'text-center mono'
    },
    {
        label: 'Best Structural Distance',
        samfeoKey: 'dist_val',
        fastDesignKey: 'dist_val',
        className: 'text-center mono'
    },
    {
        label: 'Sequence w/ Best Distance',
        samfeoKey: 'dist_seq',
        fastDesignKey: 'dist_seq',
        className: 'text-center mono'
    },
    {
        label: '# of MFE Design',
        samfeoKey: 'mfe',
        fastDesignKey: 'mfe',
        className: 'text-center mono'
    },
    {
        label: '# of uMFE Design',
        samfeoKey: 'umfe',
        fastDesignKey: 'umfe',
        className: 'text-center mono'
    },
    {
        label: 'MFE Design Example',
        samfeoKey: 'mfe_sample',
        fastDesignKey: 'mfe_sample',
        className: 'text-center mono'
    },
    {
        label: 'uMFE Design Example',
        samfeoKey: 'umfe_sample',
        fastDesignKey: 'umfe_sample',
        className: 'text-center mono'
    },
    {
        label: 'Time (seconds)',
        samfeoKey: 'time',
        fastDesignKey: 'time',
        className: 'text-center mono'
    }
];