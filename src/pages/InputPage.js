/* TODO
   - Allow user to input text file
   - Select sample structures from dropdown
   - Reset button for arguments
*/

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import InputField from '../components/InputField';
import LoadingSpinner from '../components/LoadingSpinner';
import Citation from '../components/Citation';
import SAMFEOForm from '../components/SAMFEOForm';
import FastDesignForm from '../components/FastDesignForm';
import FormDivider from '../components/FormDivider';
import { validateSAMFEOInputs, validateFastDesignInputs } from '../utils/validation';
import { submitSAMFEO, submitFastDesign, handleAPIError } from '../services/api';

export default function InputPage() {
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [SAMFEOEnabled, setSAMFEOEnabled] = useState(false);
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

        // If no errors, display loading symbol
        setLoading(true);

        console.log(structure, temperature, queue, step, object);
        console.log(structure, motifstep, poststep, prune, path);

        let SAMFEOResult = null;
        let fastDesignResult = null;

        const requests = [];

        // SAMFEO request
        if (samfeo) {
            const SAMFEOPromise = submitSAMFEO(structure, temperature, queue, step, object)
                .then(data => {
                    SAMFEOResult = data;
                });
            requests.push(SAMFEOPromise);
        }

        // SAMFEO++ request
        if (fastdesign) {
            const fastDesignPromise = submitFastDesign(structure, motifstep, poststep, prune, path)
                .then(data => {
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
            setFormErrors(prevErrors => ({
                ...prevErrors,
                ...handleAPIError(err)
            }));
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
                    
                    <FormDivider />

                    <FastDesignForm
                        enabled={fastDesignEnabled}
                        onEnabledChange={(e) => setFastDesignEnabled(e.target.checked)}
                        formErrors={formErrors}
                        motifstepRef={motifstepField}
                        poststepRef={poststepField}
                        pruneRef={pruneField} />
                    
                    <FormDivider />

                    <SAMFEOForm
                        enabled={SAMFEOEnabled}
                        onEnabledChange={(e) => setSAMFEOEnabled(e.target.checked)}
                        formErrors={formErrors}
                        temperatureRef={temperatureField}
                        queueRef={queueField}
                        stepRef={stepField} />

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