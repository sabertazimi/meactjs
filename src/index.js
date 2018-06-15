import style from './index.css';

const TEXT_ELEMENT_TYPE = 'text element';
const CHILDREN_PROP = 'children';

const createTextElement = (value) => {
    return createElement(TEXT_ELEMENT_TYPE, {
        nodeValue: value
    });
}

const createElement = (type, config, ...args) => {
    const props = { ...config };
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

const render = (element, parentDOM) => {
    const {
        type,
        props
    } = element;

    // create DOM element
    const isTextElement = type === TEXT_ELEMENT_TYPE;
    const dom = isTextElement ?
        document.createTextNode('') :
        document.createElement(type);

    // add event listeners
    const isListener = name => name.startsWith('on');
    Object.keys(props).filter(isListener).forEach((name) => {
        const eventType = name.toLowerCase().substring(2); // trip off 'on'
        dom.addEventListener(eventType, props[name]);
    });

    // set properties
    const isAttribute = name => !isListener(name) && name !== CHILDREN_PROP;
    Object.keys(props).filter(isAttribute).forEach((name) => {
        dom[name] = props[name];
    });

    // render children
    const childElements = props.children || [];
    childElements.forEach(childElement => render(childElement, dom));

    // append to parent
    // if (!parentDOM.lastChild) {
        parentDOM.appendChild(dom);
    // } else {
        // parentDOM.replaceChild(dom, parentDOM.lastChild);
    // }
};

const meactElement = (
    <div id="container">
      <input value="foo" type="text" />
      <a href="/bar">bar</a>
      <span onClick={e => alert("Hi")}>click me</span>
    </div>
);

render(meactElement, document.getElementById('root'));

export {
    render
};