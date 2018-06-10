const TEXT_ELEMENT_TYPE = 'text element';
const CHILDREN_PROP = 'children';

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
    parentDOM.appendChild(dom);
};

const meactElement = {
    type: 'div',
    props: {
        id: 'container',
        children: [{
                type: 'input',
                props: {
                    value: 'foo',
                    type: 'text'
                }
            },
            {
                type: 'a',
                props: {
                    href: '/bar'
                }
            },
            {
                type: 'span',
                props: {}
            },
            {
                type: TEXT_ELEMENT_TYPE, 
                props: {
                    nodeValue: 'text'
                }
            }
        ]
    }
};

export {
    render
};