import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import InputField from '../components/InputField';
import RadioButton from '../components/RadioButton';

export default function InputPage() {
    const [formErrors, setFormErrors] = useState({});

    const onSubmit = (ev) => {
        ev.preventDefault();
        console.log('handle form here');
    };

    return (
        <Body>
            <h3>Add a dot-bracket structure</h3>
            <Form onSubmit={onSubmit}>
                <InputField
                    name="structure" as={"textarea"} rows={5}
                    label={<span><b>Type</b> or <b>paste</b> your dot-bracket structure here:</span>}
                    value={"......(((((........))))).............."}
                    error={formErrors.structure} />
                <h3>Arguments</h3>
                <InputField
                    name="temperature" label={<b>Sampling temperature</b>}
                    value={"1"}
                    error={formErrors.temperature} />
                <InputField
                    name="queue" label={<b>Frontier (priority queue) size</b>}
                    value={"10"}
                    error={formErrors.queue} />
                <Form.Group controlId={"object"} className="RadioButton">
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
                </Form.Group>
                <InputField
                    name="step" label={<b>Step (maximum number of iterations)</b>}
                    value={"5000"}
                    error={formErrors.step} />
                <Button variant="primary" type="submit">Run SAMFEO</Button>
            </Form>
        </Body>
    );
}