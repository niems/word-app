import idb from 'idb'
import Events from 'events';

class Database {
  constructor(addItemsCallback) {
    console.log('database constructor');
    this.db = undefined;
    this.dbUpgraded = false; //true if db was upgraded when opened
    this.emitter = new Events.EventEmitter();

    this.emitter.on('onDBOpen', () => {
      console.log('Successfully opened database :D');

      
      if (this.dbUpgraded) {
        addItemsCallback(true); //adds items to db since it was just upgraded
      }
      
      else {
        addItemsCallback(false);
        //this.getDataRange('STR');        
      }
    });

    //creates/upgrades the database version
    this.upgradeDB = this.upgradeDB.bind(this); 

    //adds ONE DATA ( {w, d} in this case) to the database
    this.addData = this.addData.bind(this);
    
    this.calculateUpperBound = this.calculateUpperBound.bind(this);
    this.calculateSearchRange = this.calculateSearchRange.bind(this);

    //returns all data in object store
    this.getAllData = this.getAllData.bind(this);

    //returns all the data within specified range
    this.getDataRange = this.getDataRange.bind(this);

    //this.getWord = this.getWord.bind(this);
    //removes ONE DATA ( {w, d} in this case) from the database
    //this.removeData = this.removeData.bind(this);
    
    //delete the given database
    this.deleteDB = this.deleteDB.bind(this);
  }

  getEmitter() { return this.emitter; }

  getDatabase() {
    return this.db;
  }


  upgradeDB() {
    if (!('indexedDB' in window)) {
      console.log("This browser doesn't support indexedDB");
      return false;
    }

    let dbPromise = idb.open('dictionaryDB', 1, (upgrade) => {
      console.log('Upgrading DB');
      this.dbUpgraded = true; 

      if ( !upgrade.objectStoreNames.contains('dictionary') ) {
        console.log('Creating dictionary OS...');
        let os = upgrade.createObjectStore('dictionary', {keyPath: 'word'});
        os.createIndex('word', 'word', {unique: true});
      }
    });

    dbPromise.then( db => {
      this.db = db;
      this.emitter.emit('onDBOpen');
      return true;
    })
    .catch( err => {
      console.log(`Error handling promise: ${err}`);
      return false;
    });
  }

  //items = [{word, id, def}, {}...]
  addData(items) {
    let current_item = ''; //stores the current item being added to the database
    
    try {
      //chained = this.db.transaction('dictionary, 'readwrite').objectStore('dictionary');
      let tx = this.db.transaction('dictionary', 'readwrite');
      let os = tx.objectStore('dictionary');

      return Promise.all( items.map( item => {
        current_item = item.word;
        return os.add(item); //adds {word, id, def}
        })
      ).then( () => {
        console.log('all items added to the database');
      }).catch( e => {
        os.abort();
        console.log(`Error: ${e.message}`);
      }).catch( e => {
        console.log(`Error: ${e.message}`);
      });
    }
    catch(e) {
      console.log(`ERROR addData(): ${e.message}`);
      console.log(`Current item: ${current_item}`);
    }
  }


  //ex. lower: 'str' --> upper: 'sts'
  //ex. lower: 'haz' --> upper: 'hb'
  calculateUpperBound(lower, upper) {
    for(let i = lower.length - 1; i >= 0; i--) { //loops through 'lower' backwards
      if ( lower[i] !== 'z' ) { //if not 'z', determines the upper bound
        upper = lower.slice(0, i) + String.fromCharCode( lower.charCodeAt(i) + 1);
        break;
      }
    }

    return upper; //returns new upper bound or what was passed
  }

  calculateSearchRange(lower, upper) {
    let range = undefined;

    if (lower === '') {
      console.log('ERROR: getDataRange() - no range specified');
      return;
    }
    
    else if (lower !== '' && upper !== '') {
      range = IDBKeyRange.bound( lower.toLowerCase(), upper.toLowerCase() );
    }

    else if (lower !== '') {
      range = IDBKeyRange.lowerBound( lower.toLowerCase() );
    }

    else {
      range = IDBKeyRange.upperBound( upper.toLowerCase() );
    }

    return range;
  }

  getAllData() {
    let tx = this.db.transaction('dictionary', 'readonly');
    let os = tx.objectStore('dictionary');

    return os.getAll();
  }

  //if upper is not provided, it will be calculated based on lower
  async getDataRange(lower = '', callback) {
    let tx = this.db.transaction('dictionary', 'readonly');
    let os = tx.objectStore('dictionary');
    let upper = ''; //upper bound for database search
    let range; //database search range

    lower = lower.toLowerCase();
    upper = this.calculateUpperBound(lower, upper);
    range = this.calculateSearchRange(lower, upper);

    console.log(`Lower bound: ${lower}`);
    console.log(`Upper bound: ${upper}`);
    
    
    callback( await os.getAll(range, 30) ); //returns the first x (10 atm - second parameter) values within specified range
  }

  //deletes current database
  deleteDB() {
    console.log('deleteDB() called');
    if ( typeof(this.db) !== 'undefined' ) { //deletes the current database if it exists
      console.log('db name not undefined');
      

      return idb.delete(this.db.name);
    }   
  }
}

export default Database;
