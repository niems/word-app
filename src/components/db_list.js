import React, {Component} from 'react'
import DBListItem from './db_list_item'
import './styles/db_list.css'

function ToListItems(props) {
    if (typeof(props.filter) !== 'null') {
        let filter = new RegExp(props.filter);

        const allItems = props.items.filter( item => (
            filter.test(item.word)
        ));

        return allItems.map( item => (
            <DBListItem className={props.id} key={item.id} id={item.id} value={item.word} onClick={props.onClick} />
        ));
    }

    return props.items.map( item => (
        <DBListItem className={props.id} key={item.id} id={item.id} value={item.word} onClick={props.onClick} />
    ));    
}

class DBList extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        let targetClasses = Array.from( e.target.classList );

        if ( targetClasses.includes( 'db-list-item-save' ) ) {
            this.props.quickSave( e.currentTarget.id );
        }

        else {
            this.props.onClick(e.currentTarget.id);
        }
    }

    render() {
        return (
            <div className='col word-list-display'> 
                <ul className='list-group'>
                    <ToListItems items={this.props.items} filter={this.props.filter} onClick={this.onClick} />
                </ul>
            </div>
        );
    }
}

export default DBList;