import Form from 'react-bootstrap/Form';

export default function RadioButton(
    { label, name, fieldRef }
) {
    return (
            <Form.Check
                type={"radio"}
                label={label}
                name={name}
                ref={fieldRef}
            />
    );
}