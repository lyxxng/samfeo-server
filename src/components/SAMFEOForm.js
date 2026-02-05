import InputField from './InputField';
import CheckBox from './CheckBox';
import RadioButton from './RadioButton';

export default function SAMFEOForm({ 
    enabled, 
    onEnabledChange, 
    formErrors, 
    temperatureRef, 
    queueRef, 
    stepRef 
}) {
    return (
        <>
            <h3>SAMFEO Arguments</h3>
            <CheckBox
                name="samfeo"
                label="Find design using SAMFEO"
                checked={enabled}
                onChange={onEnabledChange} />

            <InputField
                name="temperature" 
                label={<span><b>Sampling temperature</b> (0.1 - 10)</span>}
                value={"1"} 
                error={formErrors.temperature} 
                fieldRef={temperatureRef}
                disabled={!enabled} />
            <InputField
                name="queue" 
                label={<span><b>Frontier (priority queue) size</b> (1 - 10)</span>}
                value={"10"} 
                error={formErrors.queue} 
                fieldRef={queueRef}
                disabled={!enabled} />
            <InputField
                name="step" 
                label={<span><b>Number of steps</b> (100 - 10000)</span>}
                value={"5000"} 
                error={formErrors.step} 
                fieldRef={stepRef}
                disabled={!enabled} />
            
            <RadioButton
                label={<span><b>Optimization objective</b></span>}
                name={"object"} 
                defaultValue={"pd"}
                options={[
                    { label: "Probability defect", value: "pd" },
                    { label: "Normalized ensemble defect", value: "ned" }
                ]}
                disabled={!enabled} />
        </>
    );
}