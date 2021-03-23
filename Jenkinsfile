pipeline {
    agent any 
     environment ('Set Variable database') {
        // variabili per identificare l'autonomous  
        dbname="JSONATTACK"    
        k8s_name_space="wine-demo-namespace"
        compartmentid="""${sh(
                            returnStdout: true,
                            script: '/usr/local/bin/oci  --config-file /home/jenkins/.oci/config search resource free-text-search --text JSON_ATTACK --raw-output --query "data.items[0]" |awk -F \\" \'{ if ($2==\"compartment-id\") print $4}\''
                        )}"""
        identifier="""${sh(
                            returnStdout: true,
                            script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config search resource free-text-search --text JSON_ATTACK --raw-output --query "data.items[0].identifier"'
                        )}"""                            
    }   
   stages {
        stage('K8s deploy Wine App ') {
        /* This stage builds the actual image; synonymous to  docker build on the command line */
            steps {
                timeout(time: 300, unit: 'SECONDS') {
                        waitUntil {
                            script {
                            def LBIP = """${sh(
                                            script: 'sudo runuser -l opc -c "kubectl get services --namespace=namespace-winedemo |grep \'winedemo\' | grep -v \'pending\' "'                         
                                            ,returnStatus: true 
                                        )}""" 
                            println "stampa loadbalance_ip : " +   LBIP 
//                           // println "Waiting for clone AJD "+ identifier_clone +" in status "+corret_status+" but it is : ->  " + status +"  <-"
                            return  LBIP.trim() == "0" ;
                         }
                        }
                } 
                println  "load balancer ip :" +   LBIP
            }    
        } 
    }
}     
//kubectl delete -f /var/lib/jenkins/workspace/wine_demo_master/namespace.yaml
//kubectl delete -f /var/lib/jenkins/workspace/wine_demo_master/oke_deployment.yaml   
//kubectl delete secret secret --namespace=namespace-winedemo
//kubectl get pods --namespace=namespace-winedemo
//kubectl describe pods  $(kubectl get pods --namespace=namespace-winedemo|grep wine|awk '{print $1}') --namespace=namespace-winedemo