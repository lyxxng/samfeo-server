// Default values for form inputs

export const DEFAULT_VALUES = {
    structure: "(((((......)))))",
    temperature: "1",
    queue: "10",
    step: "1000",
    motifstep: "5000",
    poststep: "0",
    prune: "90",
    object: "pd",
    path: "easy",
    samfeoEnabled: false,
    fastDesignEnabled: true
};

export const SAMPLES = [
    {
        value: '(((((......)))))',
        label: 'Simple Hairpin (len: 16)'
    },
    {
        value: '((((((.((((....))))))).)))..........',
        label: 'Prion Pseudoknot (len: 36)'
    },
    {
        value: '..(.(..((((((....))))))..).)......((((..(((.(((((((((....)))))....)))))))))))..((((((((....))))))))..',
        label: 'The Gammaretrovirus Signal (len: 101)'
    },
    {
        value: '(((((((....(((...........)))((((((((..(((((((((((((((((((...(((((......))))).)))))).)))))))))))))..))))))))..)))))))',
        label: 'Arabidopsis Thaliana 6 RNA (len: 116)'
    },
    {
        value: '((((((((((((((.((((((...........((((((((((((.....((((((((....(((((((((((((........))))))))))....))))))))....))))))....)))))...((((((.......))))))))))............)))))).))))....))))))...))))...',
        label: 'Human Integrated Adenovirus (len: 192)'
    }
];