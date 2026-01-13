/*
 * Component to render a labeled checkbox.
*/

import Form from 'react-bootstrap/Form';

export default function CheckBox(
    { name, label, checked, onChange }
) {
    return (
        <Form.Group controlId={name} className="CheckBox">
            <Form.Check
                type={"checkbox"}
                name={name}
                label={<b>{label}</b>}
                checked={checked}
                onChange={onChange}
            />
        </Form.Group>
    );
}