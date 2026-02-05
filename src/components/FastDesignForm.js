import InputField from './InputField';
import CheckBox from './CheckBox';
import RadioButton from './RadioButton';

export default function FastDesignForm({ 
    enabled, 
    onEnabledChange, 
    formErrors, 
    motifstepRef, 
    poststepRef, 
    pruneRef 
}) {
    return (
        <>
            <h3>SAMFEO++ Arguments</h3>
            <CheckBox
                name="fastdesign"
                label="Find design using SAMFEO++"
                checked={enabled}
                onChange={onEnabledChange} />

            <InputField
                name="motifstep" 
                value={"5000"} 
                error={formErrors.motifstep} 
                fieldRef={motifstepRef}
                label={<span><b>Number of steps for leaf-node (motif-level) design</b> (100 - 10000)</span>}
                disabled={!enabled} />
            <InputField
                name="poststep" 
                value={"0"} 
                error={formErrors.poststep} 
                fieldRef={poststepRef}
                label={<span><b>Number of steps for root-node (full structure) refinement</b> (0 - 2500)</span>}
                disabled={!enabled} />
            <InputField
                name="prune" 
                label={<span><b>Beam size for cubic pruning</b> (10 - 100)</span>}
                value={"90"} 
                error={formErrors.prune} 
                fieldRef={pruneRef}
                disabled={!enabled} />

            <RadioButton
                label={<span><b>Motifs used for structure decomposition</b></span>}
                name={"path"} 
                defaultValue="easy"
                options={[
                    { label: "Easy motifs", value: "easy" },
                    { label: "Helix motifs", value: "helix" }
                ]}
                disabled={!enabled} />
        </>
    );
}