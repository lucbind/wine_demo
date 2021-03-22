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
        stage('Clone Git') {
             steps {
                 // The below will clone your repo and will be checked out to master branch by default.
                 //  git config --global credential.username lucabind
                 //  git config --global credential.helper "Oneiros!973"
              git url: 'https://github.com/lucbind/wine_demo.git'
             }  
        }   
        stage ('Verify Variable'){
            steps {
                echo "AJD compartmentid ${compartmentid}"
                echo "AJD identifier is ${identifier}"
                echo "AJD dbname is ${dbname}"
                sh 'printenv'
            }
        }

        stage('Clone Autonomous DB') {
/*
               environment { 
                      identifier_clone = """${sh(
                                            // script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config search resource free-text-search --text ${dbname}01 --raw-output --query "data.items[?!(contains(\\"lifecycle-state\\", \'TERMINATED\'))].\"identifier\"|[0]"' 
                                            script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config search resource free-text-search --text ${dbname}01 --raw-output --query "data.items[?!(contains(\\"lifecycle-state\\", \'TERMINATED\'))].\"identifier\"|[0]"' 
                                            ,returnStdout: true 
                                        )}"""
                } 
*/
            steps {
                script {
                     clone = """${sh(
                            script: '/usr/local/bin/oci  --config-file /home/jenkins/.oci/config  db autonomous-database create-from-clone --compartment-id ${compartmentid} --db-name ${dbname}01 --cpu-core-count 1 --source-id ${identifier} --clone-type full --admin-password DataBase##11 --data-storage-size-in-tbs 2 --is-auto-scaling-enabled true --display-name CLONEJENK --license-model LICENSE_INCLUDED'
                            ,returnStatus: true 
                            )}"""
                    if (clone==0) {
                        println "autonomous database in creazione"
                        }else {
                          println "autonomous database gia presente"  
                        }
                }
            }
        }           
        stage('Get Wallet') {       
                environment { 
                      identifier_clone = """${sh(
                                            returnStdout: true,
                                             script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config search resource free-text-search --text ${dbname}01 --raw-output --query  "data.items[0].identifier"' 
                                        )}"""
                      corret_status="AVAILABLE"
                }
                        // 10 minuti  
                steps {
               // timeout(time: 600, unit: 'SECONDS') {
                timeout(time: 30, unit: 'SECONDS') {
                        waitUntil {
                            script {
                            def status = """${sh(
                                            script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config db autonomous-database get --autonomous-database-id ${identifier_clone} --raw-output --query \"data\"|awk -F \\" \'{ if ($2==\"lifecycle-state\")  print $4 }\''                         
                                            ,returnStdout: true 
                                        )}""" 
                            println "stampa status : " +   status 
//                           // println "Waiting for clone AJD "+ identifier_clone +" in status "+corret_status+" but it is : ->  " + status +"  <-"
                            return  (status.trim()  == "AVAILABLE" );
                         }
                        }
                }                      
                script {
                    sh '''/usr/local/bin/oci --config-file /home/jenkins/.oci/config db autonomous-database generate-wallet --file dbwallet.zip --password DataBase##11 --autonomous-database-id  ${identifier_clone}'''
                    }
                }  
        }     
/* rimuove il commento           
        stage('Build docker image') {
            steps {
            sh "cp dbwallet.zip json-in-db-master/WineDemo"
            sh "sudo docker build json-in-db-master/WineDemo/. -t windemo:1"
            sh "sudo docker login -u 'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com' -p 'uASDz34:E0c)4i0uh{m]' eu-frankfurt-1.ocir.io"
            sh "sudo docker tag eu-frankfurt-1.ocir.io/emeaseitalysandbox/windemo:1 eu-frankfurt-1.ocir.io/emeaseitalysandbox/winedemo:winedemo"
            sh 'sudo docker push eu-frankfurt-1.ocir.io/emeaseitalysandbox/winedemo:winedemo'
            }    
        } 
rimuove il commento  */
        stage('K8s deploy App ') {
        /* This stage builds the actual image; synonymous to  docker build on the command line */
            steps {
                sh 'sudo runuser -l opc -c "kubectl create secret docker-registry secret --docker-server=eu-frankfurt-1.ocir.io --docker-username=\'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com\' --docker-password=\'uASDz34:E0c)4i0uh{m]\' --docker-email=\'a@b.com\'"'
                sh 'sudo runuser -l opc -c "sudo docker login -u \'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com\' -p \'uASDz34:E0c)4i0uh{m]\' eu-frankfurt-1.ocir.io "'
                sh 'sudo runuser -l opc -c "kubectl apply -f /var/lib/jenkins/workspace/wine_demo_master/namespace.yaml"'
                sh 'sudo runuser -l opc -c "kubectl apply -f /var/lib/jenkins/workspace/wine_demo_master/oke_deployment.yaml"'
                timeout(time: 30, unit: 'SECONDS') {
                        waitUntil {
                            script {
                            def LBIP = """${sh(
                                            script: 'sudo runuser -l opc -c "kubectl get services --namespace=namespace-winedemo | grep \'winedemo\' | awk \'{print $4}\'"'                         
                                            ,returnStdout: true 
                                        )}""" 
                            println "stampa loadbalance_ip : " +   LBIP 
//                           // println "Waiting for clone AJD "+ identifier_clone +" in status "+corret_status+" but it is : ->  " + status +"  <-"
                            return  (LBIP.trim()  );
                         }
                        }
                } 
                echo "external-IP $LBIP"
            }    
        } 
    }
}    
//kubectl delete -f /var/lib/jenkins/workspace/wine_demo_master/namespace.yaml
//kubectl delete -f /var/lib/jenkins/workspace/wine_demo_master/oke_deployment.yaml   
//kubectl delete secret docker-registry secret