import {
    createDOMElement,
    updateDOMProperties
} from './dom-utils.js';
import {
    createInstance as createPublicInstance
} from './component.js';

// fiber tags
const HOST_COMPONENT = 'host';
const CLASS_COMPONENT = 'class';
const HOST_ROOT = 'root';

// effect tags
const PLACEMENT = 1;
const DELETION = 2;
const UPDATE = 3;

const ENOUGH_TIME = 1; // milliseconds

// global state
const updateQueue = [];
let nextUnitOfWork = null;
let pendingCommit = null;

const performWork = (deadline) => {
    workloop(deadline);
    
    // checks if there's pending work
    if (nextUnitOfWork || updateQueue.length > 0) {
        requestIdleCallback(performWork);
    }
};

const workloop = (deadline) => {
    if (!nextUnitOfWork) {
        resetNextUnitOfWork();
    }

    while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (pendingCommit) {
        commitAllWork(pendingCommit);
    }
};

const resetNextUnitOfWork = () => {

};

const performUnitOfWork = (work) => {

};

const commitAllWork = (pendingCommit) => {

};

const scheduleUpdate = (instance, partialState) => {
    updateQueue.push({
        from: CLASS_COMPONENT,
        instance,
        partialState
    });

    requestIdleCallback(performWork);
};

const render = (elements, container) => {
    updateQueue.push({
        from: HOST_ROOT,
        dom: container,
        newProps: { children: elements }
    });

    requestIdleCallback(performWork);
};


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

export {
    scheduleUpdate,
    render
};