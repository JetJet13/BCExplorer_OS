# BCExplorer_OS - B&C Explorer
[![Join the chat at https://gitter.im/bcexplorer-os/Lobby](https://badges.gitter.im/bcexplorer-os/Lobby.svg)](https://gitter.im/bcexplorer-os/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
### Description
An open source block explorer for the B&C Exchange network. 
For more information about the B&C Exchange network visit <http://bcexchange.org>

A block explorer is an application that sorts and displays information regarding a blockchain(s). So things like
+ block data
+ transaction data
+ address data
+ motion and custodian data.
+ network status
+ network statistics


### Getting Started
Before we get into setup and installation, let's layout the requirements and tools/frameworks used in this project.
+ [B&C Exchange Client](http://bcexchange.org)
+ [Python](https://www.python.org/downloads/) (2.7)
+ [NPM](https://www.npmjs.com/) (2.x)
+ [NodeJS](https://nodejs.org/en/) (4.x)
+ [PostgreSQL](https://www.postgresql.org/) (>=9.4)
+ [ExpressJS](https://expressjs.com/) (>=4.x)
+ [AngularJS](https://angularjs.org/) (>=1.4.3)
+ [Sass](http://sass-lang.com/)
+ [Grunt](http://gruntjs.com/)


#### Python Dependencies
Defined in `requirements.txt`

## Setup
Before you start with the setup, make sure you have installed all the required tools 
(B&C Exchange Client, Python, NPM, NodeJS, PostgreSQL, Sass, Grunt, Virtualenv) 

On Linux systems it is advised to run the software as a non-root user.  
Create a new user with the `sudo adduser bcex` command and answering the questions.  
(`bcex` is specified as a user name here as that is used in config files later in these instructions.  
If you want to use a different user name, you will need to change some file paths later on to reflect the change)
  
Once you have your user created you can switch to that user with  
```Bash
$ sudo -u bcex -i
```

Next step is to clone and compile this repo.
```Bash
git clone https://github.com/JetJet13/BCExplorer_OS.git
cd ./BCExplorer_OS
# Depending on your OS
npm install # Windows Users
sudo npm install # Linux Users
```
### PostgreSQL Setup
After you have installed PostgreSQL (>=9.4) the first thing we are going to do is create a database.

#### Windows Users
  Open `Windows Powershell` and navigate to your PostgreSQL `bin` folder to start up `psql.exe`<br/> 
  ```Powershell
  > cd "C:\Program Files\PostgreSQL\{version}\bin"`
  > ./psql 
  ```
  When it starts up, you should be connected with a user with superadmin privileges `postgres` <br/>
  Now, you need to create a database called `bcexchange` <br/>
  ```SQL
  CREATE DATABASE bcexchange; 
  ```
 Once complete, you can either exit `\q` or create a user with full privileges to `bcexchange`<br/>
  
  To create a user will full privileges to the `bcexchange` database,
  ```SQL
  CREATE USER ENTER_USERNAME WITH PASSWORD 'ENTER_PASSWORD';
  GRANT ALL PRIVILEGES ON DATABASE "bcexchange" to ENTER_USERNAME;
  \q # to exit
  ```
  
  If you want to connect to the database through psql with the new user, you can use <br/>
  ```Powershell
  > ./psql -d bcexchange -U ENTER_USERNAME
  ```
  
#### Linux Users
  When you install PostgreSQL on Linux, it creates a user called `postgres`, 
  so let's use the newly created user to access psql.<br/>
  ```Bash
  $ sudo su - postgres
  $ psql
  ```
  Now, you need to create a database called `bcexchange` <br/>
  ```SQL
  CREATE DATABASE bcexchange; 
  ```
  Once complete, you can either exit `\q` or create a user with full privileges to `bcexchange`<br/>
  
  To create a user will full privileges to the `bcexchange` database,
  ```SQL
  CREATE USER ENTER_USERNAME WITH PASSWORD 'ENTER_PASSWORD';
  GRANT ALL PRIVILEGES ON DATABASE "bcexchange" to ENTER_USERNAME;
  \q # to exit
  ```
  
  If you want to connect to the database through `psql` with the new user, you can use <br/>
  ```Bash
  $ ./psql -d bcexchange -U ENTER_USERNAME
  ```

### Python Setup
#### Linux Users
We will install Python dependencies to a virtualenv in the root of the BCExplorer_OS directory.  
Run the following commands as the `bcex` user
```Bash
$ cd BCExplorer_OS  
$ virtualenv ve
```    
Then you can install the python dependencies into the virtualenv  
```Bash
$ ve/bin/pip install -r requirements.txt
```

#### Windows Users
Instructions to follow

### B&C Exchange Client Setup
Make sure to download, unzip and install (if your on windows) the B&C Exchange Client before starting this setup.<br/> 
We need to create a configuration file for the client, so that we can connect to the client and make rpc requests. 
#### Windows Users
  Navigate to `C:\Users\{username}\AppData\Roaming\BCExchange`. Note that AppData may be hidden. <br/>
  Create and save a text file `bcexchange.conf`. If you get a prompt, click yes. <br/>
  Open the empty file with Notepad and paste in the following
  ```
rpcport=2240
rpcuser=<ENTER_USERNAME>
rpcpassword=<ENTER_PASSWORD>
server=1
  ```
  Set `rpcuser` and `rpcpassword` to whatever you like and then save and exit.<br/>
  
  Now, we want to start up the client, so navigate to where you downloaded and unzipped the folder and double-click either 
  `bcexchange.exe` or `bcexchanged.exe`  
#### Linux Users
```Bash
# non-root user
$ cd /home/bcex/.bcexchange/
# then
$ sudo pico bcexchange.conf
```
Paste in the following
```
rpcport=2240
rpcuser=<ENTER_USERNAME>
rpcpassword=<ENTER_PASSWORD>
server=1
```
Set `rpcuser` and `rpcpassword` to whatever you like and then save and exit.<br/>

---

### Edit Source Files

For this part of the setup, we are going to edit some source files to match the settings you created earlier,
specifically 

1. bin/www
2. public/api/api_tools.js

Open up these files and replace 

#### Setting Up Credentials
Open the settings.yaml file and fill in the details. This file will be used by all the files in `pyScripts` for connection to `RPC` and `Postgres`  

```angular2html
daemon_rpc:
  username: <ENTER_RPC_USERNAME>
  password: <ENTER_RPC_PASSWORD>

database:
  database_name: bcexchange
  username: <ENTER_DATABASE_USERNAME>
  password: <ENTER_DATABASE_PASSWORD>
```

---

#### Setting Up File Paths

Next open `/pyScripts/BC_parser.py` and `/pyScripts/BC_insert.py` and make the following changes
#### Windows Users
First you have to comment out or delete lines. <br/>
###### BC_insert.py `343`, `344`, `345`
###### BC_parserv02.py `491`, `492`, `493`

Then you have to uncomment lines <br/>
###### BC_insert.py `348`, `349`, `350` and replace `home` with whatever your username is on your PC 
###### BC_parserv02.py `496`, `497`, `498`

After you have done these two steps to both files, they should both look like this
```Python
# Linux Users
# blk01 = "/root/.bcexchange/blk0001.dat"
# blk02 = "/root/.bcexchange/blk0002.dat"
# blk = ""

#  Windows Users
blk01 = "C:/users/{username}/appdata/roaming/bcexchange/blk0001.dat"
blk02 = "C:/users/{username}/appdata/roaming/bcexchange/blk0002.dat"
blk = ""
```

#### Linux Users
The only thing you have to do to both files is make sure that lines <br/>
###### BC_insert.py `343`, `344`, `345`
###### BC_parserv02.py `491`, `492`, `493`
are pointing to the right folder, that is, if you are on `root` user, then you don't have to make any changes.<br/>
Otherwise, replace `/root` with `/home/{username}`

### Database Schema
The next thing we have to do is run a python script that will create all the tables and triggers necessary for the explorer to work.<br/>
Make sure that the B&C Exchange Client is running before you start the script
#### Windows Users
```Powershell
> python /{folder-location}/BCExplorer_OS/pyScripts/PostgresSetup.py
```
#### Linux Users
```Bash
$ sudo -u bcex -i
$ cd BCExplorer_OS
$ ve/bin/python pyScripts/PostgresSetup.py
```
Once complete, you are ready to start inserting data into the database

### Inserting Data
To insert data into the database, make sure that you successfully completed the sections **Database Schema**
and **Edit Source Files**<br/>
Make sure that the B&C Exchange Client is running before you start the script
#### Windows Users
```Powershell
> python /{folder-location}/BCExplorer_OS/pyScripts/BC_insert.py
```
#### Linux Users
Run this as the `bcex` user and from the `/home/bcex/BCExplorer_OS` directory
```Bash
$ ve/bin/python pyScripts/BC_insert.py
```

### Launching Explorer
Only launch the explorer if you have inserted data into the database. Otherwise you will get errors.
#### Windows Users
```Powershell
> cd /{folder-location}/BCExplorer_OS
> grunt server
```
Visit `localhost:80` to view the application. 

If you get an error: 
```
DEPRECATION WARNING:
	Sass 3.5 will no longer support Ruby 1.9.3.
	Please upgrade to Ruby 2.0.0 or greater as soon as possible.
```
The explorer will still work fine, but if you want to fix it, visit	[this post](https://community.c9.io/t/how-to-upgrade-ruby/1355)<br/>

*If there are any other errors in which you cannot fix, raise an issue in this repo and I'll try my best to help you.*
#### Linux Users
We will set up `supervisor` to manage the processes that need to run for the exchange.  
We will also set up `Nginx` to act as a reverse proxy and manage the web requests.  
These need to be installed and run by a user with `sudo` capabilities.  
The instructions below are for Debian based systems (Ubuntu, Mint etc.), on other systems the package names and file paths may differ.  
The supplied config files will work for the setup with the `bcex` user as described above.  
If you have used a different username or installed code to different paths, you will need to alter the conf files accordingly.  
  
First you need to install both applications. 
```bash
$ sudo apt-get install nginx supervisor
```
---
Supervisor  
Copy the conf files found in `<this repo>/confs/supervisor` to `/etc/supervisor/conf.d`.  
Then run
```bash
$ sudo service supervisor start
$ sudo supervisorctl update
```
This will start the supervisor manage and the managed programs defined in the conf files.  
You can check on the status with the following command:  
```bash
$ sudo supervisorctl status
```
This will show you the current state of the managed program. Log files created by the managed programs will be saved to the `bcex` users home directory as defined in the conf files.  
---
Nginx  
Open the `<this_repo>/confs/nginx/explorer.conf` file and replace `<server_name>` with the domain name you will use to reach the block explorer.  
Copy that file to `/etc/nginx/conf.d/explorer.conf`.  
Run 
```bash
$ sudo nginx -t
```
and ensure that there are no reported errors. If everything is reported successfully, restart nginx with
```bash
$ sudo service nginx restart
```
---
Firewall  
To add a bit more protection to the server you can set up some simple firewall rules.
```bash
$ sudo apt-get install ufw
$ sudo ufw allow ssh
$ sudo ufw allow http
$ sudo ufw enable
```

You should now be able to reach the block explorer on your domain. I would recommend enabling SSL and obtaining a certificate through LetsEncrypt but that is beyond the scope of this README.

## Final Remarks
Setup requires you to work in the order in which the sections are layed out. 
Skipping over some sections will only give you problems. 

If you plan on using this in production, public API's come built-in, so you will need to edit the file `/public/html/apis.html`<br/>
Specifically, you will have to find and replace all `YOUR_DOMAIN` snippets with the domain of your site.<br/>
ie) `YOUR_DOMAIN/api/v1/block/3000` => `https://bcblockexplorer.com/api/v1/block/3000`


If you have any questions/issues or feedback, please do not hesitate to raise an issue in this repo, or 
leave a message in the chat room.

**Best of Luck**

## Licensing
The MIT License (MIT)

Copyright (c) 2016 Johny Georges

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
