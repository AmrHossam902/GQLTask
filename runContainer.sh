
sudo docker stop graph_app;
sudo docker rm graph_app;
sudo docker run -p 5555:5555 --rm --name=graph_app -d graph_app;