/* TODO
   - Allow user to input text file
   - Range for numerical arguments & validation
   - Select sample structures from dropdown
   - Reset button for arguments
*/

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import Header from '../components/Header';
import InputField from '../components/InputField';
import RadioButton from '../components/RadioButton';
import CheckBox from '../components/CheckBox';
import LoadingSpinner from '../components/LoadingSpinner';

export default function InputPage() {
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const structureField = useRef();
    const temperatureField = useRef();
    const queueField = useRef();
    const stepField = useRef();

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

        // Radio button and checkboxes
        const form = ev.target;
        const object = form.object.value;
        const init = form.init.value;
        const nosm = form.nosm.checked;
        const nomfe = form.nomfe.checked;

        const errors = {};

        // Text input validation
        if (!structure) {
            errors.structure = 'Specify a dot-bracket structure.';
        }
        if (!temperature) {
            errors.temperature = 'Specify a sampling temperature.';
        }
        if (!queue) {
            errors.queue = 'Specify a frontier size.';
        }
        if (!step) {
            errors.step = 'Specify a step value.';
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);

        console.log(structure, temperature, queue, step, object, init, nosm, nomfe);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                structure: structure,
                temperature: temperature,
                queue: queue,
                step: step,
                object: object,
                init: init,
                nosm: nosm,
                nomfe: nomfe
            })
        };

        try {
            const response = await fetch("/api/submit", requestOptions);
            const data = await response.json();

            if (!response.ok) {
                console.error("Error:", data.error);

                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    structure: "Invalid dot-bracket structure."
                }));
                setLoading(false);

                return;
            }

            navigate("/results", { state: data })

        } catch (err) {
            console.error("Error:", err);
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header />
            <Body>
                <h3>Add a dot-bracket structure</h3>
                <Form onSubmit={onSubmit}>
                    <InputField
                        name="structure" as={"textarea"} rows={5}
                        label={<span><b>Type</b> or <b>paste</b> your dot-bracket structure here (length &gt; 5):</span>}
                        value={"......(((((........))))).............."}
                        error={formErrors.structure} fieldRef={structureField} />
                    <h3>Arguments</h3>
                    <InputField
                        name="temperature" label={<b>Sampling temperature</b>} value={"1"}
                        error={formErrors.temperature} fieldRef={temperatureField} />
                    <InputField
                        name="queue" label={<b>Frontier (priority queue) size</b>} value={"10"}
                        error={formErrors.queue} fieldRef={queueField} />
                    <RadioButton
                        label={<b>Optimization objective</b>}
                        name={"object"} defaultValue={"pd"}
                        options={[
                            { label: "Probability defect", value: "pd" },
                            { label: "Normalized ensemble defect", value: "ned" }
                        ]} />
                    <RadioButton
                        label={<b>Sequence initialization method</b>}
                        name={"init"} defaultValue={"cg"}
                        options={[
                            { label: "Constraint-guided", value: "cg" },
                            { label: "Uniform random", value: "all" }
                        ]} />
                    <InputField
                        name="step" label={<b>Step (maximum number of iterations)</b>} value={"5000"}
                        error={formErrors.step} fieldRef={stepField} />
                    <CheckBox
                        name="nosm" label="Disable structured mutation" />
                    <CheckBox
                        name="nomfe" label="Disable MFE as product" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Button variant="primary" type="submit">Run SAMFEO</Button>
                    {loading && <LoadingSpinner></LoadingSpinner>}
                    </div>
                </Form>
            </Body>
        </Container>
    );
}