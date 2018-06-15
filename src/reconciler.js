import {
    createDOMElement,
    updateDOMProperties
} from './dom-utils.js';
import {
    createPublicInstance
} from './component.js';

let rootInstance = null;

// core function 1: render DOM/component element to true DOM node
const instantiate = (element) => {
    const {
        type,
        props
    } = element;
    const isDOMElement = typeof type === 'string';

    if (isDOMElement) {
        // create DOM element
        const dom = createDOMElement(element);

        // instantiate children
        const childElements = props.children || [];
        const childInstances = childElements.map(instantiate);

        // append children
        const childDOMs = childInstances.map(childInstance => childInstance.dom);
        childDOMs.forEach(childDOM => dom.appendChild(childDOM));

        // construct instance with attributes and children
        const instance = {
            dom,
            element,
            childInstances
        };
        return instance;
    } else {
        // create component instance
        const instance = {};
        const publicInstance = createPublicInstance(element, instance);
        const childElement = publicInstance.render(); // re-render with new state
        const childInstance = instantiate(childElement);
        const dom = childInstance.dom;
        Object.assign(instance, {
            dom,
            element,
            childInstance,
            publicInstance
        });
        return instance;
    }
};

// core function 2: update DOM/component instance
const reconcile = (parentDOM, instance, element) => {
    if (instance === null) {
        // add new instance
        const newInstance = instantiate(element);
        parentDOM.appendChild(newInstance.dom);
        return newInstance;
    } else if (element === null) {
        // remove old instance
        parentDOM.removeChild(instance.dom);
        return null;
    } else if (instance.element.type !== element.type) {
        // replace instance when different types
        const newInstance = instantiate(element);
        parentDOM.replaceChild(newInstance.dom, instance.dom);
        return newInstance;
    } else if (typeof element.type === 'string') {
        // update DOM instance when same type (re-use dom node)
        updateDOMProperties(instance.dom, instance.element.props, element.props);
        instance.childInstances = reconcileChildren(instance, element);
        instance.element = element;
        return instance;
    } else {
        // update component instance
        instance.publicInstance.props = element.props;
        const childElement = instance.publicInstance.render();
        const oldChildInstance = instance.childInstance;
        const childInstance = reconcile(parentDOM, oldChildInstance, childElement);
        instance.dom = childInstance.dom;
        instance.childInstance = childInstance;
        instance.element = element;
        return instance;
    }
};

const reconcileChildren = (instance, element) => {
    const dom = instance.dom;
    const childInstances = instance.childInstances;
    const nextChildElements = element.props.children || [];
    const count = Math.max(childInstances.length, nextChildElements.length);

    const newChildInstances = [];

    for (let i = 0; i < count; ++i) {
        const childInstance = childInstances[i];
        const childElement = nextChildElements[i];
        const newChildInstance = reconcile(dom, childInstance, childElement);
        newChildInstances.push(newChildInstance);
    }

    return newChildInstances.filter(instance => instance !== null);
};

const updateInstance = (internalInstance) => {
    const parentDOM = internalInstance.dom.parentNode;
    const element = internalInstance.element;
    reconcile(parentDOM, internalInstance, element);
};

const render = (element, container) => {
    const prevInstance = rootInstance;
    const nextInstance = reconcile(container, prevInstance, element);
    rootInstance = nextInstance;
};

export {
    updateInstance,
    render
};