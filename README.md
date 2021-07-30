
# CloudDrive

### A simple (yet powerful) web file server

## Table of contents
* Installation and configuration
* Documentation
    * Client documentation
    * Server documentation

## Installation and configuration
1- Clone this repository on the machine that will run the server. 

2- NPM is a dependency for the app to run, so install it. For example, on Debian-based OSes: `(sudo) apt install npm`.

3- This repository contains a base start script (`start.sh.example`). Copy it to the file `start.sh` (or any other name you wish, but keep in mind that `start.sh` will be ignored by Git by default. For simplicity, the documentation will always use the name `start.sh` Then, edit its contents as follows:
* Set the exported variable CLOUDDRIVE_PORT to the desired port (or leave it on the default value).
* Set the exported variable CLOUDDRIVE_STORAGE to the directory that will act as root for the storage.

4- Once the variables are configured, it's time to run the app with the command `./start.sh` (or any other file name that you decided previously). This will install the needed dependencies with `npm` and run the app on the specified port (make sure that the script has execution permissions (`chmod +x ./start.sh`)).

5- The server should now be running if nothing went wrong. Verify it by accessing to `http://localhost:CLOUDDRIVE_PORT` (replace CLOUDDRIVE_PORT with the port set on the configuration).

## Documentation

### Glossary:
* File -> File with uppercase 'F' in the documentation will usually refer to files and directories, not only files.
* Handlers -> Handlers' job is to manage different app behaviour and functionalities.

Both the client and the server are written in JavaScript. The client is loaded by the server as a static dependency, so there is no need to do specific client configurations.

### Client documentation
As said above, the client is written in JavaScript along with Bootstrap for various styles and dialogs.

* File structure:
    * index.html -> Contains the HTML content of the web, such as dialogs and containers.
    * assets:
        * js -> Contains the JavaScript components (except Bootstrap).
        * img -> Contains the images, such as icons.
        * bootstrap -> Contains the Bootstrap-specific files.
        * css -> Contains the style sheets of the app.

* JavaScript component structure:
    * main.js -> This is the JavaScript file whose job is to initialize the different components such as the session handler or the delete queue. It also configures different buttons.
    * components -> Contains the different classes that do different jobs:
        * DeleteQueue -> The job of this class is to get files registered into a queue that will be processed once requested, sending requests to the server to delete the specific files and directories.
        * FileItem -> This class will initialize a button with a file or directory icon, depending on what the File is. This class can be registered in the session handler for other components to interact with the different File buttons.
        * MaterialButton -> Base class for the FileItem.
        * SessionHandler -> This class' job is to manage client-server interaction, contains some variables to act as context for other components, generates the FileItems based on the server's response in a infinite loop so the contents of the client are always up-to-date with the server's contents. This class also manages the active directory and allows to move between the different directories.
        * UploadHandler -> This class's job is to show a dialog to upload a single file, and upload the file to the server in chunks, which the server will use to reconstruct the file. More information about the upload process at TODO.
