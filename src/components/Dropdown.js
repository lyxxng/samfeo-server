/*
 * Component for displaying a dropdown.
 */

export default function Dropdown(
    { label, value, onChange, options }
) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', midWidth: '80px' }}>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}