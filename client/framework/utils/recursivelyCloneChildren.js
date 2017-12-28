import { Children, cloneElement, isValidElement } from 'react';

let recursivelyCloneChildren = (children, transform) => {
    if  (!children) {
        return children;
    }
    // refer: React traverseAllChildrenImpl
    // bug fix for react 0.13 @2015.07.02
    // option should not have non-text children
    // <option>11</option>
    // React.Children.map(option.props.children,function(c){return c}) => {'.0':'11'}
    const type = typeof children;
    if (type === 'boolean' || type === 'string' || type === 'number') {
        return children;
    }
    const ret = Children.map(children, child => {
        if (isValidElement(child)) {
            let extraProps = transform(child) || {};
            if (child.props && child.props.children) {
                let newChild = recursivelyCloneChildren(child.props.children, transform);
                child = cloneElement(child, extraProps, newChild);
            }
            child = cloneElement(child, extraProps);
        }
            
        return child;
    });
    // if only one child, then flatten
    if (ret.length === 1) {
        return ret[0];
    }
    return ret;
}
export default recursivelyCloneChildren;
