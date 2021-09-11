sudo rm ./* -r;
git clone --branch master https://github.com/AmrHossam902/GQLTask.git GraphApp;
git clone --branch Mysql https://github.com/AmrHossam902/GQLTask.git Mysql;

mkdir ./Mysql/data
docker-compose -f GraphApp/docker-compose.yml up;
