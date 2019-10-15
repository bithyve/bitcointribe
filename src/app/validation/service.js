import validatejs from 'validate.js';
import { StyleSheet } from 'react-native';

import { validationDictionary } from './dictionary';

const styles = StyleSheet.create({
    error: {
        alignSelf: 'flex-start',
        marginLeft: 10,
        flex: 0.01,
        color: 'red',
        fontSize: 12
    }
});

export const validationService = {
    onInputChange,
    getInputValidationState,
    validateInput,
    getFormValidation,
    styles
};

function onInputChange({ id, value, cb = () => {} }) {
    console.log({ id, value });
    const { inputs } = this.state;
    this.setState(
        {
            inputs: {
                ...inputs,
                [id]: getInputValidationState({
                    input: inputs[id],
                    value
                })
            }
        },
        cb
    );
}

function getInputValidationState({ input, value }) {
    return {
        ...input,
        value,
        errorLabel: input.optional
            ? null
            : validateInput({ type: input.type, value })
    };
}

function validateInput({ type, value }) {
    const result = validatejs(
        {
            [type]: value
        },
        {
            [type]: validationDictionary[type]
        }
    );

    if (result) {
        return result[type][0];
    }

    return null;
}

function getFormValidation() {
    const { inputs } = this.state;
    const updatedInputs = {};
    for (const [key, input] of Object.entries(inputs)) {
        updatedInputs[key] = getInputValidationState({
            input,
            value: input.value
        });
    }
    this.setState({
        inputs: updatedInputs
    });
}
