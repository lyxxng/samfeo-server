/* TODO
   - Allow user to input text file
   - Select sample structures from dropdown
   - Reset button for arguments
*/

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import InputField from '../components/InputField';
import CheckBox from '../components/CheckBox';
import RadioButton from '../components/RadioButton';
import LoadingSpinner from '../components/LoadingSpinner';
import Citation from '../components/Citation';

const API_URL = process.env.REACT_APP_API_URL;

export default function InputPage() {
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [SAMFEOEnabled, setSAMFEOEnabled] = useState(true);
    const [fastDesignEnabled, setFastDesignEnabled] = useState(true);

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
        if (!structure) {
            errors.structure = 'Specify a dot-bracket structure.';
        }

        // Validation for SAMFEO arguments
        if (samfeo) {
            if (!temperature) {
                errors.temperature = 'Specify a sampling temperature.';
            } else if (!/^\d+$/.test(temperature)) {
                errors.temperature = 'Must be a numerical value.';
            } else if (Number(temperature) < 0.1 || Number(temperature) > 10) {
                errors.temperature = 'Sampling temperature must be between 0.1 and 10.';
            }

            if (!queue) {
                errors.queue = 'Specify a frontier size.';
            } else if (!/^\d+$/.test(queue)) {
                errors.queue = 'Must be a numerical value.';
            } else if (Number(queue) < 1 || Number(queue) > 10) {
                errors.queue = 'Frontier size must be between 1 and 10.';
            }

            if (!step) {
                errors.step = 'Specify a step value.';
            } else if (!/^\d+$/.test(step)) {
                errors.step = 'Must be a numerical value.';
            } else if (Number(step) < 100 || Number(step) > 10000) {
                errors.step = 'Step value must be between 100 and 10000.';
            }
        }
        
        // Validation for SAMFEO++ arguments
        if (fastdesign) {
            if (!motifstep) {
                errors.motifstep = 'Specify a step value.';
            } else if (!/^\d+$/.test(motifstep)) {
                errors.motifstep = 'Must be a numerical value.';
            } else if (Number(motifstep) < 100 || Number(motifstep) > 10000) {
                errors.motifstep = 'Step value must be between 100 and 10000.';
            }

            if (!poststep) {
                errors.poststep = 'Specify a step value.';
            } else if (!/^\d+$/.test(poststep)) {
                errors.poststep = 'Must be a numerical value.';
            } else if (Number(poststep) < 0 || Number(poststep) > 2500) {
                errors.poststep = 'Step value must be between 0 and 2500.';
            }

            if (!prune) {
                errors.prune = 'Specify a beam size.';
            } else if (!/^\d+$/.test(prune)) {
                errors.prune = 'Must be a numerical value.';
            } else if (Number(prune) < 10 || Number(prune) > 100) {
                errors.prune = 'Beam size must be between 10 and 100.';
            }
        }

        // Display any errors and stop submission
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        // If no errors, display loading symbol
        setLoading(true);

        console.log(structure, temperature, queue, step, object);
        console.log(structure, motifstep, poststep, prune, path);

        let SAMFEOResult = null;
        let fastDesignResult = null;

        const requests = [];

        // SAMFEO request
        if (samfeo) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    structure: structure,
                    temperature: temperature,
                    queue: queue,
                    step: step,
                    object: object
                })
            };

            const SAMFEOPromise = fetch(`${API_URL}/samfeo_submit`, requestOptions)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    const error = new Error(data.error || 'Unknown error');
                    error.status = res.status;
                    throw error;
                }
                SAMFEOResult = data;
            });

            requests.push(SAMFEOPromise);
        }

        // SAMFEO++ request
        if (fastdesign) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    structure: structure,
                    step: motifstep,
                    poststep: poststep,
                    k_prune: prune,
                    motif_path: path
                })
            };

            const fastDesignPromise = fetch(`${API_URL}/fastdesign_submit`, requestOptions)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    const error = new Error(data.error || 'Unknown error');
                    error.status = res.status;
                    throw error;
                }
                fastDesignResult = data;
            });

            requests.push(fastDesignPromise);
        }

        // Get data from all requests
        try {
            await Promise.all(requests);

            navigate("/results", {
                state: {
                    s: SAMFEOResult,
                    f: fastDesignResult
                }
            });

        } catch (err) {
            console.error("Error:", err);

            // Handle different error types
            if (err.status === 408) {
                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    submit: "Request timed out. The algorithm exceeded the maximum time limit. Try reducing the number of steps or structure size."
                }));
            } else if (err.status === 400) {
                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    structure: err.message || "Invalid dot-bracket structure."
                }));
            } else if (err.status === 504) {
                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    submit: "Server timeout. The algorithm is taking too long. Try reducing the number of steps or structure size."
                }));
            } else {
                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    submit: err.message || "An error occurred while processing your request. Please try again."
                }));
            }
            
            setLoading(false);
            return;
        }
    };

    return (
        <Body>
            <div className='input-card'>
                <h3>Add a dot-bracket structure</h3>
                <Form onSubmit={onSubmit}>
                    <InputField
                        name="structure" as={"textarea"} rows={5}
                        label={<span><b>Type</b> or <b>paste</b> your dot-bracket structure here (length &gt; 5):</span>}
                        value={"(((((......)))))"}
                        error={formErrors.structure} fieldRef={structureField} />
                    
                    <hr style={{
                        margin: '2rem 0',
                        borderTop: '2px solid',
                        opacity: '0.5'
                    }} />

                    <h3>SAMFEO Arguments</h3>
                    <CheckBox
                        name="samfeo"
                        label="Find design using SAMFEO"
                        checked={SAMFEOEnabled}
                        onChange={(e) => setSAMFEOEnabled(e.target.checked)} />

                    <Row>
                        <Col md={5} lg={6}>
                            <InputField
                            name="temperature" label={<span><b>Sampling temperature</b> (0.1 - 10)</span>}
                            value={"1"} error={formErrors.temperature} fieldRef={temperatureField}
                            disabled={!SAMFEOEnabled} />
                            <InputField
                            name="queue" label={<span><b>Frontier (priority queue) size</b> (1 - 10)</span>}
                            value={"10"} error={formErrors.queue} fieldRef={queueField}
                            disabled={!SAMFEOEnabled} />
                            <InputField
                            name="step" label={<span><b>Number of steps</b> (100 - 10000)</span>}
                            value={"5000"} error={formErrors.step} fieldRef={stepField}
                            disabled={!SAMFEOEnabled} />
                        </Col>
                    </Row>
                    
                    <RadioButton
                        label={<span><b>Optimization objective</b></span>}
                        name={"object"} defaultValue={"pd"}
                        options={[
                            { label: "Probability defect", value: "pd" },
                            { label: "Normalized ensemble defect", value: "ned" }
                        ]}
                        disabled={!SAMFEOEnabled} />
                    
                    <hr style={{
                        margin: '2rem 0',
                        borderTop: '2px solid',
                        opacity: '0.5'
                    }} />

                    <h3>SAMFEO++ Arguments</h3>
                    <CheckBox
                        name="fastdesign"
                        label="Find design using SAMFEO++"
                        checked={fastDesignEnabled}
                        onChange={(e) => setFastDesignEnabled(e.target.checked)} />

                    <Row>
                        <Col md={5} lg={6}>
                            <InputField
                                name="motifstep" value={"5000"} error={formErrors.motifstep} fieldRef={motifstepField}
                                label={<span><b>Number of steps for leaf-node (motif-level) design</b> (100 - 10000)</span>}
                                disabled={!fastDesignEnabled} />
                            <InputField
                                name="poststep" value={"0"} error={formErrors.poststep} fieldRef={poststepField}
                                label={<span><b>Number of steps for root-node (full structure) refinement</b> (0 - 2500)</span>}
                                disabled={!fastDesignEnabled} />
                            <InputField
                                name="prune" label={<span><b>Beam size for cubic pruning</b> (10 - 100)</span>}
                                value={"90"} error={formErrors.prune} fieldRef={pruneField}
                                disabled={!fastDesignEnabled} />
                        </Col>
                    </Row>

                    <RadioButton
                        label={<span><b>Motifs used for structure decomposition</b></span>}
                        name={"path"} defaultValue="easy"
                        options={[
                            { label: "Easy motifs", value: "easy" },
                            { label: "Helix motifs", value: "helix" }
                        ]}
                        disabled={!fastDesignEnabled} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '30px' }}>
                    <Button name="submit" variant="primary" type="submit">Run</Button>
                    {loading && <LoadingSpinner></LoadingSpinner>}
                    </div>

                    <Form.Text className="text-danger">{formErrors.submit}</Form.Text>
                </Form>
            </div>
            
            <Citation></Citation>
            
        </Body>
    );
}