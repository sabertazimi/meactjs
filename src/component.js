import {
    updateInstance
} from './reconciler.js';

class Component {
    constructor(props) {
        this.props = props;
        this.state = this.state || {};
    }

    setState(partialState) {
        this.state = { ...this.state,
            ...partialState
        };
        updateInstance(this.__internalInstance);
    }
}

const createPublicInstance = (element, internalInstance) => {
    const {
        type,
        props
    } = element;
    const publicInstance = new type(props);
    publicInstance.__internalInstance = internalInstance;
    return publicInstance; // return component instance
};

export {
    Component,
    createPublicInstance
};