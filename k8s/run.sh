# mongo
kubectl apply -f mongo_pv.yaml
kubectl apply -f mongo_pvc.yaml
kubectl apply -f mongo_deployment.yaml
kubectl apply -f mongo_service.yaml

# web
docker build -t victortsaitw12/d3-practice-web:v7 .
docker push victortsaitw12/d3-practice-web:v7
kubectl apply -f web_deployment.yaml
kubectl apply -f web_service.yaml

# restful
docker build -t victortsaitw12/d3-practice-restful:v2 .
docker push victortsaitw12/d3-practice-restful:v2
kubectl apply -f restful_deployment.yaml
kubectl apply -f restful_service.yaml

# auth
docker build -t victortsaitw12/d3-practice-auth:v3 .
docker push victortsaitw12/d3-practice-auth:v3
kubectl apply -f auth_deployment.yaml
kubectl apply -f auth_service.yaml

# crawler
docker build -t victortsaitw12/d3-practice-crawler:v3 .
docker push victortsaitw12/d3-practice-crawler:v3
kubectl apply -f crawler_deployment.yaml
