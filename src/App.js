import React, { Component } from 'react';
import Database from './database'
import FileControl from './file_control'
import SelectedView from './components/selected_view'
import WordList from './components/word_list'
import DBList from './components/db_list'
import './components/styles/App.css'  

function OpeningDatabase(props) {
  return (
    <div className='container-fluid wrapper'>
      <Titlebar />

      <div className='loading-database'>
        <h2 className='loading-database-text'><small>Opening teh database...</small></h2>
      </div>
    </div>
  );
}

function LoadingDatabase({progress}) {
  return (
    <div className='container-fluid wrapper'>
      <Titlebar />
      
      <div className='loading-data'>
        <h2 className='loading-data-text'><small>Loading teh datas...</small></h2>

        <div className='progress'>
          <div className='progress-bar' id='current-progress' role='progressbar' style={{width: progress}}>
            {progress}
          </div>
        </div>

      </div>
    </div>
  );
}

function MainDisplay({progress, wordInputVal, wordInputChange, dbInputVal, dbInputChange, savedItems, savedFilter, savedOnSelect,
                         savedQuickRemove, selectedData, selectedOnDataSave, dbItems, dbFilter, dbOnSelect, dbQuickSave}) {
  if ( progress === -2 ) {
    return (
      <OpeningDatabase />
    );
  }

  else if (progress !== -1) {
    return (
      <LoadingDatabase progress={progress} />
    );
  }

  return (
    <div className='container-fluid wrapper'>
      <Titlebar />

      <div className='row word-list-input-fields'>
          <InputField id={'filter-input-field'}
                      placeholder={'Filter saved words...'}
                      value={wordInputVal}
                      onChange={wordInputChange} />          

            <InputField id={'database-input-field'}
                        placeholder={'Search database...'}
                        value={dbInputVal}
                        onChange={dbInputChange} />
        </div>

      <div className='row main-display'>
        <WordList items={savedItems} filter={savedFilter} onClick={savedOnSelect} quickRemove={savedQuickRemove} />
        <SelectedView selected={selectedData} onDataSave={selectedOnDataSave} />
        <DBList items={dbItems} filter={dbFilter} onClick={dbOnSelect} quickSave={dbQuickSave} />
      </div>
    </div>
  );
}

function InputField({id, placeholder, value, onChange}) {
  return (
    <input type='text' className={'input-field ' + id} placeholder={placeholder} value={value} onChange={onChange} />
  );
}

function Titlebar(props) {
  return (
    <div className='row main-titlebar'>

      <div className='col-1'>
        <i className='material-icons titlebar-icons main-settings'>settings</i>
      </div>

      <div className='col-9'></div>

      <div className='col window-functions'>
        <i className='material-icons titlebar-icons icon-remove'>remove</i>
        <i className='material-icons titlebar-icons icon-maximize'>check_box_outline_blank</i>
        <i className='material-icons titlebar-icons icon-close'>close</i>
      </div>

    </div>
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.allThemes = ['white_theme.css',
                      'slate_theme.css',
                      'dark_theme.css'];
    
    this.onWordFilter = this.onWordFilter.bind(this); //new filter entered
    this.onDBSearch = this.onDBSearch.bind(this); //new database search entered

    this.onSelect = this.onSelect.bind(this); //used with both word and database click selections below - passed [] to find selected word
    this.onWordListSelect = this.onWordListSelect.bind(this); //user selected new word - displayed in selection view
    this.onDBListSelect = this.onDBListSelect.bind(this); //user selected db search result - displayed in selection view

    this.onDBSetup = this.onDBSetup.bind(this); //adds word files to database since it was just created
    this.onDBListUpdate = this.onDBListUpdate.bind(this); //callback when a new search is made in the database input

    this.onSaveSelectedWord = this.onSaveSelectedWord.bind(this); //saves the current selected word to the word list
    this.onQuickSave = this.onQuickSave.bind(this); //saves the current db search result to the saved word list
    this.onQuickRemove = this.onQuickRemove.bind(this); //removes the current saved word from the saved word list

    this.db = new Database(this.onDBSetup);
    this.files = new FileControl(); //stores data from files
    
    this.state = {
      loadingProgress: -2, //default -1 - if 0+ value LoadingData() will render in place of main_display
      databaseWords: [],
      savedWords: [],
      selected: {
        word: 'example word',
        id: 'example word029350',
        def: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna ante, maximus ut euismod quis, tincidunt consequat justo. Mauris ac nunc at leo ullamcorper tempor in vehicula augue. Praesent consequat mauris sit amet ipsum eleifend, eget imperdiet nunc posuere. Morbi eu enim lorem. Cras eu justo egestas, dignissim turpis finibus, faucibus lectus. Nam eu vehicula ligula. Sed vitae dui nunc.'
      },

      wordFilter: '', //current saved word list filter
      dbSearch: '', //current word used to search the database
    }
  }

  updateTheme() {
    let current_theme = this.css_theme.href.split('/')[3]; //ex. main_style.css

    for(let i = 0; i < this.allThemes.length; i++) {
      if (current_theme === this.allThemes[i]) { //current theme found
        if (i + 1 < this.allThemes.length) { //if there is a 'next' theme
          this.css_theme.href = this.allThemes[i+1];
        }

        else { //resets to the first theme
          this.css_theme.href = this.allThemes[0];
        }
        
        break;
      }
    }
  }

  componentDidMount() {
    this.db.upgradeDB(); //opens database - creates & populates DB if necessary
    this.css_theme = document.getElementsByTagName('link')[0]; //holds the DOM link for the main css style
  }

  onWordFilter(e) {
    let term = e.target.value.toString().toLowerCase();

    if ( term !== '?' ) {
      this.setState( { wordFilter: term } );
    }    
  }

  onDBSearch(e) {
    try {
      let term = e.target.value.toString().toLowerCase();

      if(term !== '?') {
        this.setState({dbSearch: term});
      }      

      if (term !== '') {
        this.db.getDataRange(term, this.onDBListUpdate);
      }

      else {
        this.setState({ databaseWords: [] }); //reset
      }
    }
    catch(e) {
      console.log(`ERROR onDBSearch(): ${e.message}`);
    }    
  }

  onSelect(id, allWords) {
    this.updateTheme();

    for (let i = 0; i < allWords.length; i++) {
      if (allWords[i].id === id) {
        this.setState({
          selected: {
            word: allWords[i].word,
            id: allWords[i].id,
            def: allWords[i].def
          }
        });

        break;
      }
    }
  }

  onWordListSelect(id) {
    this.onSelect(id, this.state.savedWords);
  }

  onDBListSelect(id) {
    this.onSelect(id, this.state.databaseWords);
  }

  //adds items to the DB since it was just upgraded
  async onDBSetup(updateDatabase) {    
    try {

      if ( !updateDatabase ) {
        this.setState( { loadingProgress: -1 } );
      }

      else {
        let base_path = './src/updated_sitemap_data/';
        //let allFiles = await this.files.pullDirFiles('./src/allWords');
        let allFiles = await this.files.pullDirFiles( base_path );
        let fileData = ''; //holds current file data
        let c_progress = 0; //current file progress
        let progressbar_update = 200; //how often to update the progressbar in milliseconds
        let i = 0;

        let tempInvervalID = setInterval( () => {
            c_progress = ( ( (i + 1) / allFiles.length) * 100); 

            this.setState({
              loadingProgress: c_progress.toFixed(0) + '%'
            });
          },
          progressbar_update
        );    

        //loads all file data and adds to DB - passes file data to DB once current file is processed
        for(; i < allFiles.length; i++) {
          console.log(`File ${i+1}: processing ${allFiles[i]}`);

          fileData = await this.files.getFileData( base_path, allFiles[i] ); //reads in all data from file
          await this.db.addData( JSON.parse( fileData ) ); //new - await
        }

        //clear interval & reset state
        if ( typeof(tempInvervalID) !== 'undefined' ) {
          clearInterval( tempInvervalID );
        }

        this.setState({
          loadingProgress: -1
        });

        let data = await this.db.getAllData();
        console.log(`Total words: ${data.length}`);

        this.db.deleteDB();
        
        console.log('Await test--------------------------');
      }
    }
    catch(e) {
      console.log(`Error onDBSetup(): ${e.message}`);
      await this.db.deleteDB();
      console.log('after deleteDB call');
    }
    
  }

  onDBListUpdate(results) {
    let newList = results;

    for (let i = 0; i < newList.length; i++) {
      Object.defineProperty(newList[i], 'id', {
        value: newList[i].word + i
      });
    }

    this.setState({databaseWords: newList});
  }

  //saves the currently selected word to the word list
  onSaveSelectedWord() {
    let selected = this.state.selected;
    let allSaved = this.state.savedWords;

    for ( let i = 0; i < allSaved.length; i++ ) {
      if ( allSaved[i].word === selected.word ) {
        console.log('word already exists in saved list');
        return; //word already exists in list
      }
    }

    allSaved.unshift({
      word: selected.word,
      id: selected.id,
      def: selected.def
    });

    this.setState({savedWords: allSaved});
  }

  //saves the current db search result to the saved word list
  onQuickSave(id) {
    let saved_list = this.state.savedWords; //where clicked item is to be stored
    let db_list = this.state.databaseWords; //where clicked item data is pulled
    let save_index = -1;

    for(let i = 0; i < db_list.length; i++) { //finds the database word selected to be saved
      if ( db_list[i].id === id ) {
        save_index = i; //stores the index of the database word selected to be saved
        break;
      }
    }

    for(let i = 0; i < saved_list.length; i++) { //checks if selected word to be saved is already saved
      if ( saved_list[i].id === db_list[save_index].id ) { //match found - word already saved
        save_index = -1; //ensures word will not be duplicated
        break;
      }
    }

    if ( save_index !== -1 ) {
      saved_list.unshift( db_list[save_index] );
      this.setState( { savedWords: saved_list } ); 
    }
  }

  //removes the current word from the saved word list
  onQuickRemove(id) {
    let savedList = this.state.savedWords;
    let removeIndex = -1;

    for(let i = 0; i < savedList.length; i++) {
      if ( savedList[i].id === id ) {
        removeIndex = i; //saved word to be removed from list
        break;
      }
    }

    if ( removeIndex !== -1 ) {
      savedList.splice( removeIndex, 1 ); //removes clicked word from word list
      this.setState( { savedWords: savedList } );
    }
  }

  render() {
    return (

        <MainDisplay progress={this.state.loadingProgress}
                     wordInputVal={this.state.wordFilter} wordInputChange={this.onWordFilter} dbInputVal={this.state.dbSearch} dbInputChange={this.onDBSearch} 
                     savedItems={this.state.savedWords} savedFilter={this.state.wordFilter} savedOnSelect={this.onWordListSelect} savedQuickRemove={this.onQuickRemove}
                     selectedData={this.state.selected} selectedOnDataSave={this.onSaveSelectedWord}
                     dbItems={this.state.databaseWords} dbFilter={this.state.dbSearch} dbOnSelect={this.onDBListSelect} dbQuickSave={this.onQuickSave} />
    );
  }
}


export default App;