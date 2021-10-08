const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid'); // Helper method for generating unique ids
const notesFile = require('./db/db.json')
const PORT = process.env.PORT || 3001;
const readFromFile = util.promisify(fs.readFile);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const notesArray = []
// get request for note routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});
// get request for api routes
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});
// function to write data to the json file 
const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
    );
// function to read data from json file
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

// post route for new note submission
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };
        readAndAppend(newNote, './db/db.json');
        notesArray.push(newNote)
        console.log(notesArray);
        res.json(`Note added successfully`);
    } else {
        res.error('Error in adding note');
    }
});


// delete route to delete a note
app.delete(`/api/notes/:id`, (req, res) => {
    for (let index = 0; index < notesArray.length; index++) {
        if (notesArray[index].id === req.params.id) {
            notesArray.splice(index, 1)
            break;
        }
    }
    writeToFile("./db/db.json", notesFile); // re-writes file with deleted note gone
    res.json(notesFile)
})
// get request returns html file 
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);
// listens for server port location 
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} `)
);

