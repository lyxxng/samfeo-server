/*
 * Component to render a labeled checkbox.
*/

import Form from 'react-bootstrap/Form';

export default function CheckBox(
    { name, label }
) {
    return (
        <Form.Group controlId={name} className="CheckBox">
            <Form.Check
                type={"checkbox"}
                name={name}
                label={<b>{label}</b>}
            />
        </Form.Group>
    );
}