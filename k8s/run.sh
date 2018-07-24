# mongo
kubectl apply -f mongo_pv.yaml
kubectl apply -f mongo_pvc.yaml
kubectl apply -f mongo_deployment.yaml
kubectl apply -f mongo_service.yaml

# web
docker build -t victortsaitw12/d3-practice-web:v2 .
docker push victortsaitw12/d3-practice-web:v2
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
