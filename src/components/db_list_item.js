import React from 'react'
import './styles/db_list_item.css'

const DBListItem = (props) => {
    return (
        <li className='list-group-item db-list-group-item' id={props.id} onClick={props.onClick}>
            <div className='db-list-group-item-display'>
                <span className='db-list-item-value'>{props.value}</span>
                <i className='material-icons db-list-item-save'>save</i>
            </div>
        </li>
    );
};



export default DBListItem;