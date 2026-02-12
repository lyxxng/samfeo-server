/*
 * Component for a dropdown.
*/

import Dropdown from 'react-bootstrap/dropdown';

export default function DropdownSelect(
    { label, value, onSelect, options, className = '' }
) {
    const currentLabel = options[value] || value;

    return (
        <div className={`dropdown ${className}`}>
            <span className="dropdown__label">
                {label}
            </span>
            <Dropdown onSelect={onSelect}>
                <Dropdown.Toggle variant="secondary" className="dropdown__toggle">
                    {currentLabel}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {Object.entries(options).map(([key, displayLabel]) => (
                        <Dropdown.Item
                            key={key}
                            eventKey={key}
                            active={key === value}
                        >
                            {displayLabel}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
}