/*
 * Component to render a group of radio buttons.
 */

import Form from 'react-bootstrap/Form';

export default function RadioButton(
    { name, label, options, error, defaultValue }
) {
    return (
        <Form.Group controlId={name} className="RadioButton">
            {label && <Form.Label>{label}</Form.Label>}
            <div>
                {options.map((option, index) => {
                    return (
                        <Form.Check
                            key={index}
                            type={"radio"}
                            label={option.label}
                            name={name}
                            value={option.value}
                            defaultChecked={option.value === defaultValue} />
                    );
                })}
            </div>
            {/* <Form.Text className="text-danger">{error}</Form.Text> */}
        </Form.Group>
    );
}