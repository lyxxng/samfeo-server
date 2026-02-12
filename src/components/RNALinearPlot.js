/*
 * Component that displays an interactive base pairing probability linear
 * plot using plotly. Allows user to toggle between different sequences.
 */

// TODO: Maybe get rid of MFE and uMFE option?

import { useEffect, useState } from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import GradientLegend from './GradientLegend';
import { fetchAllRNAPlots } from '../services/api';
import { C_COLORS, I_COLORS, C_LABELS, I_LABELS, SEQ } from '../constants/plotValues';

const Plot = createPlotlyComponent(Plotly);

// Move outside to prevent re-rendering
const SEQ_KEYS = Object.keys(SEQ);

export default function RNALinearPlot(
    { samfeoData, fastDesignData }
) {
    const [allPlotsData, setAllPlotsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default is SAMFEO++ best probability sequence
    const [selectedProgram, setSelectedProgram] = useState('SAMFEO++')
    const [selectedSeq, setSelectedSeq] = useState('prob_seq')

    useEffect(() => {
        if (samfeoData && !fastDesignData) {
            setSelectedProgram('SAMFEO');
        } else if (!samfeoData && fastDesignData) {
            setSelectedProgram('SAMFEO++')
        }
    }, [samfeoData, fastDesignData]);

    useEffect(() => {
        const fetchAllPlotData = async () => {
            try {
                setLoading(true);

                const plots = {};

                // Fetch SAMFEO plots
                if (samfeoData) {
                    plots['SAMFEO'] = await fetchAllRNAPlots(samfeoData, SEQ_KEYS);
                }

                // Fetch SAMFEO++ plots
                if (fastDesignData) {
                    plots['SAMFEO++'] = await fetchAllRNAPlots(fastDesignData, SEQ_KEYS);
                }

                setAllPlotsData(plots);
                setError(null);
            } catch (err) {
                console.error('Error fetching RNA plots:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (samfeoData || fastDesignData) {
            fetchAllPlotData();
        }
    }, [samfeoData, fastDesignData]);

    const getCurrentPlot = () => {
        if (!allPlotsData[selectedProgram]) return null;
        return allPlotsData[selectedProgram][selectedSeq];
    };

    const currentPlot = getCurrentPlot();

    // Only allow the user to select programs if they ran both
    const showProgramDropdown = samfeoData && fastDesignData;

    if (loading) {
        return (
            <div className="rna-plot-message">
                <p>Loading RNA structure plots...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rna-plot-message rna-plot-message--error">
                <p>An error occurred while loading the plot</p>
            </div>
        );
    }

    if (!currentPlot) {
        return (
            <div className="rna-plot-message">
                <p>No plot data available for selected options</p>
            </div>
        );
    }

    return (
        <div className="rna-plot-container">
            <div className="rna-plot-controls">
                {showProgramDropdown && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Program:</label>
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                        >
                            <option value="SAMFEO">SAMFEO</option>
                            <option value="SAMFEO++">SAMFEO++</option>
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Sequence:</label>
                    <select
                        value={selectedSeq}
                        onChange={(e) => setSelectedSeq(e.target.value)}
                    >
                        {Object.entries(SEQ).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Plot
                data={currentPlot.data}
                layout={currentPlot.layout}
                config={{
                    responsive: true,
                    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'lasso2d', 'select2d', 'resetScale2d'],
                    displayLogo: false,
                    toImageButtonOptions: {
                        format: 'png',
                        filename: 'rna_structure_bpp',
                        height: 800,
                        width: 1200,
                        scale: 2
                    }
                }}
                style={{ width: '100%', height: '100%' }}
            />

            <div className="rna-plot-legends">
                <GradientLegend
                    title="correct base-pair probability"
                    colors={C_COLORS}
                    labels={C_LABELS}
                />
                <GradientLegend
                    title="incorrect base-pair probability"
                    colors={I_COLORS}
                    labels={I_LABELS}
                />
            </div>
        </div>
    );
}