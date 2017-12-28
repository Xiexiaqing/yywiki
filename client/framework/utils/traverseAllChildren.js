import { Children } from 'react';

let traverseAllChildren = (children, callback) => {
    Children.forEach(children, (child, index) => {
        if (child && child.props && child.props.children) {
            traverseAllChildren(child.props.children, callback);
        }
        callback(child, index)
    });
}
export default traverseAllChildren;
