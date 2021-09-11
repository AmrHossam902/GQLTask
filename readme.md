# How to run 

### the project has 3 branches:
1. master: contains Dockerized nodeJs App.
2. Mysql: contains dockerized mysql App.
3. compose: contains files needed to build and run the whole App.


### Instructions
- open terminal and create a folder anywhere using this command<br>
        mkdir Run;
- go inside that folder and clone the compose branch using these command:
        cd Run;
        git clone --branch compose https://github.com/AmrHossam902/GQLTask.git compose;
    now you have compose directory inside Run containing compose branch
- go inside compose and run **run.sh** script
        cd compose;
        bash run.sh;
