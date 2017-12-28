import { shallowEquals } from "./differ";

function PureRender(component){
    if (typeof component !== "function") {
        throw new TypeError('PureRender: called without a component as the first argument');
    }

    if (component.prototype.shouldComponentUpdate) {
        throw new Error('PureRender: called on a component that already implements shouldComponentUpdate');
    }

    // mutation
    component.prototype.shouldComponentUpdate = PureRender.shouldComponentUpdate;

    return component;
}

PureRender.shouldComponentUpdate = function(nextProps, nextState){
   return !shallowEquals(this.props, nextProps) || !shallowEquals(this.state, nextState);
};

export default PureRender;
