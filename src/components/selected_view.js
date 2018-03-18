import React from 'react'
import './styles/selected_view.css'

const SelectedView = ({selected, onDataSave}) => {
    return (
        <div className='col-8 selected-word-display'>
            <h1 className='selected-word-info'><small>{selected.word}</small></h1>
            <hr className='separator'/>
            <p className='selected-def-info'>{selected.def}</p>
            <i className='material-icons selected-view-icon' id='selected-view-save' onClick={onDataSave}>save</i>
            <i className='material-icons selected-view-icon' id='selected-view-reload'>refresh</i>
        </div>
    );
}

export default SelectedView;