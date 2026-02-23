/* TODO
   - Allow user to input text file (stretch goal)
   - [x] Select sample structures from dropdown
   - [x] Log showing stdout
*/

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Body from '../components/Body';
import InputField from '../components/InputField';
import LoadingSpinner from '../components/LoadingSpinner';
import Citation from '../components/Citation';
import SAMFEOForm from '../components/SAMFEOForm';
import FastDesignForm from '../components/FastDesignForm';
import Divider from '../components/Divider';
import LogViewer from '../components/LogViewer';
import SamplePanel from '../components/SamplePanel';
import { DEFAULT_VALUES, FAMILY_LABELS, SAMPLES } from '../constants/formDefaults';
import { validateStructure, validateSAMFEOInputs, validateFastDesignInputs } from '../utils/validation';
import { submitSAMFEO, submitFastDesign, handleAPIError } from '../services/api';

export default function InputPage() {
    const [selectedSample, setSelectedSample] = useState(DEFAULT_VALUES.structure);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [SAMFEOEnabled, setSAMFEOEnabled] = useState(DEFAULT_VALUES.samfeoEnabled);
    const [fastDesignEnabled, setFastDesignEnabled] = useState(DEFAULT_VALUES.fastDesignEnabled);
    const [showLogs, setShowLogs] = useState(false);
    const [logIds, setLogIds] = useState({ samfeo: null, fastdesign: null });
    const [results, setResults] = useState({ samfeo: null, fastdesign: null });
    const [completedJobs, setCompletedJobs] = useState({ samfeo: false, fastdesign: false });

    const navigate = useNavigate();

    const structureField = useRef();
    const temperatureField = useRef();
    const queueField = useRef();
    const stepField = useRef();
    const motifstepField = useRef();
    const poststepField = useRef();
    const pruneField = useRef();

    // Cursor in structure text area
    useEffect(() => {
        structureField.current.focus();
    }, []);

    // Navigate to results when all jobs complete
    useEffect(() => {
        const samfeoShouldRun = SAMFEOEnabled;
        const fastdesignShouldRun = fastDesignEnabled;
        
        const samfeoComplete = !samfeoShouldRun || completedJobs.samfeo;
        const fastdesignComplete = !fastdesignShouldRun || completedJobs.fastdesign;
        
        if (loading && samfeoComplete && fastdesignComplete) {
            navigate("/results", {
                state: {
                    s: results.samfeo,
                    f: results.fastdesign
                }
            });
        }
    }, [completedJobs, loading, navigate, results, SAMFEOEnabled, fastDesignEnabled]);

    // Change dot-bracket structure according to selected sample
    const onSampleChange = (value) => {
        setSelectedSample(value);
        structureField.current.value = value;
    };

    const reset = () => {
        // Reset sample selection
        setSelectedSample(DEFAULT_VALUES.structure);

        // Reset all text fields to defaults
        structureField.current.value = DEFAULT_VALUES.structure;
        temperatureField.current.value = DEFAULT_VALUES.temperature;
        queueField.current.value = DEFAULT_VALUES.queue;
        stepField.current.value = DEFAULT_VALUES.step;
        motifstepField.current.value = DEFAULT_VALUES.motifstep;
        poststepField.current.value = DEFAULT_VALUES.poststep;
        pruneField.current.value = DEFAULT_VALUES.prune;

        // Reset checkboxes
        setSAMFEOEnabled(DEFAULT_VALUES.samfeoEnabled);
        setFastDesignEnabled(DEFAULT_VALUES.fastDesignEnabled);

        // Clear any errors
        setFormErrors({});

        // Stop loading and remove logs
        setLoading(false);
        setShowLogs(false);

        setLogIds({ samfeo: null, fastdesign: null });
        setResults({ samfeo: null, fastdesign: null });
        setCompletedJobs({ samfeo: false, fastdesign: false });
    };

    const onSubmit = async (ev) => {
    ev.preventDefault();

    // Text inputs
    const structure = structureField.current.value;
    const temperature = temperatureField.current.value;
    const queue = queueField.current.value;
    const step = stepField.current.value;
    const motifstep = motifstepField.current.value;
    const poststep = poststepField.current.value;
    const prune = pruneField.current.value;

    // Radio button and checkboxes
    const form = ev.target;
    const object = form.object.value;
    const path = form.path.value;
    const samfeo = form.samfeo.checked;
    const fastdesign = form.fastdesign.checked;

    const errors = {};

    // User must select at least one program to submit
    if (!samfeo && !fastdesign) {
        errors.submit = 'Select at least one program to run.';
    }

    // Text input validation
    const structureError = validateStructure(structure);
    if (structureError) errors.structure = structureError;

    // Validation for SAMFEO arguments
    if (samfeo) {
        Object.assign(errors, validateSAMFEOInputs(temperature, queue, step));
    }
    
    // Validation for SAMFEO++ arguments
    if (fastdesign) {
        Object.assign(errors, validateFastDesignInputs(motifstep, poststep, prune));
    }

    // Display any errors and stop submission
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
        return;
    }

    // If no errors, reset state and start loading
    setLoading(true);
    setShowLogs(false); // Don't show logs until we have log_ids
    setLogIds({ samfeo: null, fastdesign: null });
    setResults({ samfeo: null, fastdesign: null });
    setCompletedJobs({ samfeo: false, fastdesign: false });

    try {
        // SAMFEO request
        if (samfeo) {
            submitSAMFEO(structure, temperature, queue, step, object)
                .then(data => {
                    console.log("SAMFEO submitted, log_id:", data.log_id);
                    setLogIds(prev => ({ ...prev, samfeo: data.log_id }));
                    setShowLogs(true); // Show logs once we have at least one log_id
                })
                .catch(err => {
                    console.error("SAMFEO submission error:", err);
                    setFormErrors(prevErrors => ({
                        ...prevErrors,
                        ...handleAPIError(err)
                    }));
                    setLoading(false);
                    setCompletedJobs(prev => ({ ...prev, samfeo: true })); // Mark as complete on error
                });
        } else {
            // Mark as complete if not running
            setCompletedJobs(prev => ({ ...prev, samfeo: true }));
        }

        // FastDesign request
        if (fastdesign) {
            submitFastDesign(structure, motifstep, poststep, prune, path)
                .then(data => {
                    console.log("FastDesign submitted, log_id:", data.log_id);
                    setLogIds(prev => ({ ...prev, fastdesign: data.log_id }));
                    setShowLogs(true); // Show logs once we have at least one log_id
                })
                .catch(err => {
                    console.error("FastDesign submission error:", err);
                    setFormErrors(prevErrors => ({
                        ...prevErrors,
                        ...handleAPIError(err)
                    }));
                    setLoading(false);
                    setCompletedJobs(prev => ({ ...prev, fastdesign: true })); // Mark as complete on error
                });
        } else {
            // Mark as complete if not running
            setCompletedJobs(prev => ({ ...prev, fastdesign: true }));
        }
    } catch (err) {
        console.error("Error:", err);
        setFormErrors(prevErrors => ({
            ...prevErrors,
            ...handleAPIError(err)
        }));
        setLoading(false);
    }
};

    return (
        <Body>
            <div className='input-card'>
                <h3>Add a dot-bracket structure</h3>

                <Form onSubmit={onSubmit}>
                    <InputField
                        name="structure"
                        as="textarea"
                        rows={5}
                        label={<span><b>Type</b> or <b>paste</b> your dot-bracket structure here (length &gt; 5):</span>}
                        value={DEFAULT_VALUES.structure}
                        error={formErrors.structure}
                        fieldRef={structureField} />
                    
                    <SamplePanel
                        samples={SAMPLES}
                        familyLabels={FAMILY_LABELS}
                        value={selectedSample}
                        onChange={onSampleChange}
                    />
                    
                    <Divider />

                    <Row>
                        <Col lg={6}>
                            <FastDesignForm
                                enabled={fastDesignEnabled}
                                onEnabledChange={(e) => setFastDesignEnabled(e.target.checked)}
                                formErrors={formErrors}
                                motifstepRef={motifstepField}
                                poststepRef={poststepField}
                                pruneRef={pruneField} />
                            
                            {/* Divider only visible on mobile */}
                            <div className="d-lg-none">
                                <Divider />
                            </div>
                        </Col>
                        <Col lg={6}>
                            <SAMFEOForm
                                enabled={SAMFEOEnabled}
                                onEnabledChange={(e) => setSAMFEOEnabled(e.target.checked)}
                                formErrors={formErrors}
                                temperatureRef={temperatureField}
                                queueRef={queueField}
                                stepRef={stepField} />
                        </Col>
                    </Row>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '30px' }}>
                        <Button name="submit" variant="primary" type="submit" disabled={loading}>
                            Run
                        </Button>
                        <Button variant="secondary" type="button" onClick={reset} disabled={loading}>
                            Reset Arguments
                        </Button>
                        {loading && <LoadingSpinner />}
                    </div>

                    <Form.Text className="text-danger">{formErrors.submit}</Form.Text>
                </Form>
            </div>

            {showLogs && (
                <div className="input-card">
                    <h3>Job Progress</h3>
                    {fastDesignEnabled && logIds.fastdesign && (
                        <LogViewer 
                            programName="SAMFEO++" 
                            logId={logIds.fastdesign}
                            onComplete={(data) => {
                                console.log("FastDesign complete:", data);
                                setResults(prev => ({ ...prev, fastdesign: data }));
                                setCompletedJobs(prev => ({ ...prev, fastdesign: true }));
                            }}
                            onError={(error) => {
                                console.error("FastDesign error:", error);
                                setFormErrors(prev => ({ ...prev, submit: "An error occurred while running the program." }));
                                setLoading(false);
                                setCompletedJobs(prev => ({ ...prev, fastdesign: true }));
                            }}
                        />
                    )}
                    {SAMFEOEnabled && logIds.samfeo && (
                        <LogViewer 
                            programName="SAMFEO" 
                            logId={logIds.samfeo}
                            onComplete={(data) => {
                                console.log("SAMFEO complete:", data);
                                setResults(prev => ({ ...prev, samfeo: data }));
                                setCompletedJobs(prev => ({ ...prev, samfeo: true }));
                            }}
                            onError={(error) => {
                                console.error("SAMFEO error:", error);
                                setFormErrors(prev => ({ ...prev, submit: "An error occurred while running the program." }));
                                setLoading(false);
                                setCompletedJobs(prev => ({ ...prev, samfeo: true }));
                            }}
                        />
                    )}
                </div>
            )}
            
            <Citation />
            
        </Body>
    );
}