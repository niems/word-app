import React, {Component} from 'react'
import './styles/input_field.css'

function DisplayInputField({value, placeholder, onChange}) {
    return (
        <input type='text' value={value} placeholder={placeholder} onChange={onChange} />
    );
}

class InputField extends Component {
    constructor(props) {
        super(props);

        this.state = {search: ''};

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.setState({search: e.target.value});
    }

    render() {
        return (
            <div className='col'>
                <DisplayInputField value={this.state.search} placeholder={this.props.placeholder} onChange={this.onChange} />
            </div>            
        );
    }
}

export default InputField;