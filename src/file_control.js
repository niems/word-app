const fs = window.require('fs');

class FileControl {
    constructor() {
        this.dirFiles = []; //files returned from getDir()
    }

    //INTERNAL ONLY (can be used with 'await' in main file) - stores all files from the current directory path
    pullDirFiles(dirPath) {
        return new Promise( resolve => {
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    console.log(`ERROR - getDirFiles(): ${err.message}`);
                    return;
                }
    
                this.dirFiles = files;
                console.log('pullDirFiles() resolving');
                resolve(files);
            });
        });
    }

    //only called after getDirFiles/pullDirFiles(using 'await' in main) - will be set to [] otherwise
    displayDirFiles() {
        try {
            console.log(`displayDirFiles() length: ${this.dirFiles.length}`);
            for(let i = 0; i < this.dirFiles.length; i++) {
                console.log( `File ${i}: ${this.dirFiles[i]}` );
            }
        }
        catch (e) {
            console.log(`ERROR - displayDirFiles(): ${e.message}`);
        }  
    }

    //returns only after all directory files from the given path are pulled
    async getDirFiles(dirPath) {
        try {
            await this.pullDirFiles(dirPath);
            this.displayDirFiles(); //for testing only

            return this.dirFiles;
        }
        catch (e) {
            console.log(`ERROR pullDirFiles(): ${e.message}`);
        }
    }

    //passed the file path and filename, returns file content
    getFileData(path, file) {
        try {
            let stream = fs.createReadStream(`${path}${file}`, 'utf8');
            let fileData = ''; //stores the file content

            return new Promise( resolve => {
                stream.on('end', () => {
                    console.log(`File complete: ${file}`); 
                    resolve(fileData);
                });

                stream.on('error', e => {
                    console.log(`Error reading file: ${e.message}`);
                });

                stream.on('data', chunk => {
                    fileData += chunk;
                });
            });
        }
        catch (e) {
            console.log(`Error getFileData(): ${e.message}`);
        }
    }

}

export default FileControl;