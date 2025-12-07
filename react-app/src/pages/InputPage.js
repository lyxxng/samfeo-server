import { useEffect, useRef, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import InputField from '../components/InputField';
import RadioButton from '../components/RadioButton';

export default function InputPage() {
    const [formErrors, setFormErrors] = useState({});

    const structureField = useRef();
    const temperatureField = useRef();
    const queueField = useRef();
    const stepField = useRef();

    useEffect(() => {
        structureField.current.focus();
    }, []);

    const onSubmit = (ev) => {
        ev.preventDefault();

        const structure = structureField.current.value;
        const temperature = temperatureField.current.value;
        const queue = queueField.current.value;
        const step = stepField.current.value;

        // const form = ev.target;
        // const object = form.object.value;
        // const init = form.init.value;

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

        // Radio button validation
        // if (!object) {
        //     errors.object = 'Select an optimization objective.';
        // }
        // if (!init) {
        //     errors.init = 'Select a sequence initialization method.';
        // }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        // TODO: Continue with form submission
    };

    return (
        <Body>
            <h3>Add a dot-bracket structure</h3>
            <Form onSubmit={onSubmit}>
                <InputField
                    name="structure" as={"textarea"} rows={5}
                    label={<span><b>Type</b> or <b>paste</b> your dot-bracket structure here:</span>}
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
                    ]}
                    // error={formErrors.object} 
                    />
                <RadioButton
                    label={<b>Sequence initialization method</b>}
                    name={"init"} defaultValue={"cg"}
                    options={[
                        { label: "Constraint-guided", value: "cg" },
                        { label: "Uniform random", value: "all" }
                    ]}
                    // error={formErrors.init}
                    />

                {/* <Form.Group controlId={"object"} className="RadioButton">
                    <b>Optimization objective</b>
                    <RadioButton
                        label="Probability defect" name={"object"} />
                    <RadioButton
                        label="Normalized ensemble defect" name={"object"} />
                </Form.Group>
                <Form.Group controlId={"init"} className="RadioButton">
                    <b>Sequence initialization method</b>
                    <RadioButton
                        label="Constraint-guided" name={"init"} />
                    <RadioButton
                        label="Uniform random" name={"init"} />
                </Form.Group> */}

                <InputField
                    name="step" label={<b>Step (maximum number of iterations)</b>} value={"5000"}
                    error={formErrors.step} fieldRef={stepField} />
                <Button variant="primary" type="submit">Run SAMFEO</Button>
            </Form>
        </Body>
    );
}