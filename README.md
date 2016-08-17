# BCExplorer_OS - B&C Explorer
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
+ [Bitstring](https://pypi.python.org/pypi/bitstring/3.1.3)
+ [python-bitcoinrpc](https://github.com/jgarzik/python-bitcoinrpc)
  * Install with pip for stable version `pip install git+https://github.com/jgarzik/python-bitcoinrpc.git`
+ [simplejson](https://pypi.python.org/pypi/simplejson/)
+ [psycopg2](http://initd.org/psycopg/)
  * If your installing on Linux, you have to install it from [source](http://initd.org/psycopg/docs/install.html#install-from-source)


## Setup
Before you start with the setup, make sure you have installed all the required tools 
(B&C Exchange Client, Python, NPM, NodeJS, PostgreSQL, Sass, Grunt) 
and the python dependencies mentioned above.

Let's start by cloning and compiling this repo.
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
# root user
$ cd /root/.bcexchange
# non-root user
$ cd /home/{username}/.bcexchange/
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

Now, we want to start up the client,
```Bash
$ cd /{client-folder-location}/bin/64
$ sudo ./bcexchanged --daemon
B&C Exchange server starting
```
If you get some kind of error, go back and check if your `bcexchange.conf` file is similar to what is above.

---
The client/daemon is now going to start syncing with the rest of the network. This will take a while so feel free to take
a break at this point.

**_Important: I recommend waiting for the B&C Exchange Client to fully sync before continuing_**

### Edit Source Files

For this part of the setup, we are going to edit some source files to match the settings you created earlier,
specifically 

1. pyScripts/BC_parserv02.py
2. pyScripts/BC_insert.py
3. pyScripts/BC_charts.py
4. pyScripts/PostgresSetup.py
5. bin/www
6. public/api/api_tools.js

#### Setting Up Credentials
======
Before we make any changes, make sure you know your RPC credentials,
+ rpcuser
+ rpcpassword

and your PostgreSQL user credentials,
+ username
+ password

In your favourite IDE, open the six files above and make the following changes.
###### FIND & REPLACE
+ `<user>` => rpcuser
+ `<pass>` => rpcpassword
+ `<username>` => username
+ `<password>` => password

#### Setting Up File Paths
======
Next open `/pyScripts/BC_parserv02.py` and `/pyScripts/BC_insert.py` and make the following changes
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
$ /usr/bin/python /{folder-location}/BCExplorer_OS/pyScripts/PostgresSetup.py
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
```Bash
$ /usr/bin/python /{folder-location}/BCExplorer_OS/pyScripts/BC_insert.py
```

### Launching Explorer
Only launch the explorer if you have inserted data into the database. Otherwise you will get errors.
#### Windows Users
```Powershell
> cd /{folder-location}/BCExplorer_OS
> grunt server
```
#### Linux Users
```Bash
$ cd /{folder-location}/BCExplorer_OS
$ sudo grunt server
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

### Inserting All Data
In the **Inserting Data** section, the script `BC_insert.py` only inserted a small amount of data. You will need to insert
the rest of the blocks into the database for a complete and up-to-date block explorer.

This is done by running `BC_insert.py` and making adjustments to line `358`
```Python
fi.seek(100000,0)
```
This will only read the first 100,000 bytes of the `blk0001.dat` file. You will have to make adjustments to the values as you process/insert
the blocks.

**NOTE** `BC_insert.py` makes RPC calls to the B&C Exchange Client, so it needs to be running while the script is running.

Once you have inserted all the blocks and transactions into the database, you can run the bash scripts
#### Linux Users Only
```Bash
runparser.bash 
charts.bash
```
to continuously insert blocks and other data
```Bash
$ sudo /{folder-location}/BCExplorer_OS/runparser.bash
# AND
$ sudo /{folder-location}/BCExplorer_OS/charts.bash
```
I recommend using `tmux` when you do this.

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
