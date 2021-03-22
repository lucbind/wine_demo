sh 'sudo runuser -l opc -c "kubectl create secret docker-registry secret --docker-server=eu-frankfurt-1.ocir.io --docker-username=\'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com\' --docker-password=\'uASDz34:E0c)4i0uh{m]\' --docker-email=\'a@b.com\'"'
sh 'sudo runuser -l opc -c "sudo docker login -u \'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com\' -p \'uASDz34:E0c)4i0uh{m]\' eu-frankfurt-1.ocir.io "'
sh 'sudo runuser -l opc -c "kubectl apply -f namespace.yaml"'
sh 'sudo runuser -l opc -c "kubectl apply -f oke_deployment.yaml"'