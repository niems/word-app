import React from 'react'
import './styles/word_list_item.css'

const WordListItem = (props) => {
    return (
        <li className='list-group-item' id={props.id} onClick={props.onClick}>
            <div className='list-group-item-display'>
                <i className='material-icons list-item-delete'>close</i>
                <span className='list-item-value'>{props.value}</span>
            </div>
        </li>
    );
};



export default WordListItem;