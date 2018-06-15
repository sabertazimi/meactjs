import style from './index.css';

const TEXT_ELEMENT_TYPE = 'text element';
const CHILDREN_PROP = 'children';

let rootInstance = null;

const createTextElement = (value) => {
    return createElement(TEXT_ELEMENT_TYPE, {
        nodeValue: value
    });
};

const createElement = (type, config, ...args) => {
    const props = { ...config
    };
    const hasChildren = args.length > 0;
    const rawChildren = hasChildren ? [].concat(...args) : [];

    // transform text element when c === 'string'
    props.children = rawChildren
        .filter(c => c !== null && c !== false)
        .map(c => c instanceof Object ? c : createTextElement(c));

    return {
        type,
        props
    };
};

const render = (element, container) => {
    const prevInstance = rootInstance;
    const nextInstance = reconcile(container, prevInstance, element);
    rootInstance = nextInstance;
};

const reconcile = (parentDOM, instance, element) => {
    if (instance === null) {
        const newInstance = instantiate(element);
        parentDOM.appendChild(newInstance.dom);
        return newInstance;
    } else {
        const newInstance = instantiate(element);
        parentDOM.replaceChild(newInstance.dom, instance.dom);
        return newInstance;
    }
};

const instantiate = (element) => {
    const {
        type,
        props
    } = element;

    // create DOM element
    const isTextElement = type === TEXT_ELEMENT_TYPE;
    const dom = isTextElement ?
        document.createTextNode('') :
        document.createElement(type);

    updateDOMProperties(dom, [], props);

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
};

const updateDOMProperties = (dom, prevProps, nextProps) => {
    // add event listeners
    const isListener = name => name.startsWith('on');
    const isAttribute = name => !isListener(name) && name !== CHILDREN_PROP;

    // remove prevProps
    Object.keys(prevProps).filter(isListener).forEach((name) => {
        const eventType = name.toLowerCase().substring(2); // trip off 'on'
        dom.removeEventListener(eventType, prevProps[name]);
    });

    Object.keys(prevProps).filter(isAttribute).forEach((name) => {
        dom[name] = null;
    });

    // add nextProps
    Object.keys(nextProps).filter(isListener).forEach((name) => {
        const eventType = name.toLowerCase().substring(2); // trip off 'on'
        dom.addEventListener(eventType, nextProps[name]);
    });

    Object.keys(nextProps).filter(isAttribute).forEach((name) => {
        dom[name] = nextProps[name];
    });
};

const meactElement = (
    <div id="container">
        <input value="foo" type="text" />
        <a href="/bar">bar</a>
        <span onClick={e => alert("Hi")}>click me</span>
    </div>
);

render(meactElement, document.getElementById('root'));