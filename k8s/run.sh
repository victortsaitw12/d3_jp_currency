# mongo
kubectl apply -f mongo_volume.yaml
kubectl apply -f mongo_deployment.yaml
kubectl apply -f mongo_service.yaml

# web
docker build -t victortsaitw12/d3-practice-web .
docker push victortsaitw12/d3-practice-web
kubectl apply -f web_deployment.yaml
kubectl apply -f web_service.yaml

# restful
docker build -t victortsaitw12/d3-practice-restful .
docker push victortsaitw12/d3-practice-restful
kubectl apply -f restful_deployment.yaml
kubectl apply -f restful_service.yaml

# auth
docker build -t victortsaitw12/d3-practice-auth .
docker push victortsaitw12/d3-practice-auth
kubectl apply -f auth_deployment.yaml
kubectl apply -f auth_service.yaml

# crawler
docker build -t victortsaitw12/d3-practice-crawler .
docker push victortsaitw12/d3-practice-crawler
kubectl apply -f crawler_deployment.yaml
kubectl apply -f crawler_service.yaml

kubectl get pvc
kubectl get pods
kubectl exec -it mongo-bc979b666-8nvht -- bash

mongo:27017
web-development:8080
web-service: 8080
restful-development:8081
restful-service: 8081
auth-development: 9000
auth-service: 9000

