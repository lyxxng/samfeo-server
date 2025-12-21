/*
 * Component to render a text input field.
 */

import Form from 'react-bootstrap/Form';

export default function InputField(
    { name, label, as, rows, type, value, error, fieldRef, disabled = false }
) {
    return (
        <Form.Group controlId={name} className="InputField">
            {label && <Form.Label>{label}</Form.Label>}
            <Form.Control
                as={as || 'input'}
                rows={rows || undefined}
                type={type || 'text'}
                defaultValue={value}
                ref={fieldRef}
                disabled={disabled}
            />
            <Form.Text className="text-danger">{error}</Form.Text>
        </Form.Group>
    );
}