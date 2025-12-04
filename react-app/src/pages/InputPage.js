import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import InputField from '../components/InputField';

export default function LoginPage() {
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
                    name="dotbracket" label="Dot-bracket structure"
                    value={"......(((((........))))).............."}
                    error={formErrors.dotbracket} />
                <Button variant="primary" type="submit">Run SAMFEO</Button>
            </Form>
        </Body>
    );
}