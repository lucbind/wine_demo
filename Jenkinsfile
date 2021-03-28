pipeline {
    agent any 
  parameters {
    string(name: 'ORDS_HOST'      , defaultValue: '130.61.153.50'                 , description: 'The IP address or the FQDN of the host running ORDS')
    string(name: 'ORDS_PORT'      , defaultValue: '8088'                          , description: 'The port of the host where ORDS listens to')
    string(name: 'PROD_PDB'       , defaultValue: 'PDB1'                          , description: 'The name of the PROD pluggable database')
    string(name: 'PROD_CLONE_PDB' , defaultValue: 'PDB1_CLONE'                    , description: 'The name of the cloned PROD pluggable database')
    string(name: 'PROD_PDB_CREDS' , defaultValue: 'pdb-creds'                     , description: 'The PDB credentials from Jenkins')
    string(name: 'DB_HOSTNAME'    , defaultValue: 'cicd.subnet3.vcn.oraclevcn.com', description: 'The name of the DB host')
    string(name: 'DB_PORT'        , defaultValue: '1521'                          , description: 'The port where the DB listens to')
    string(name: 'DB_DOMAIN'      , defaultValue: 'subnet3.vcn.oraclevcn.com'     , description: 'The domain of the DB')

    string(name: 'OCIR_REGION'    , defaultValue: 'fra.ocir.io'                   , description: 'The OCI registry to push the image to')
    string(name: 'OCIR_NAMESPACE' , defaultValue: 'emeaseitalysandbox'            , description: 'The OCI tenancy namespace')
    string(name: 'OCIR_REPOSITORY', defaultValue: 'pbellardone'                   , description: 'The name of the repository')
    string(name: 'OCIR_CREDS'     , defaultValue: 'ocir-creds'                    , description: 'The OCIR credentials from Jenkins')
 
    string(name: 'AJD_NAME'       , defaultValue: 'JSONATTACK'                    , description: 'The Autonomous JSON database name')
    string(name: 'k8s_name_space' , defaultValue: 'wine-demo-namespace'           , description: 'The Namespace K8s ')
    string(name: 'compartmentid'  , defaultValue: 'xxxxxxx'           , description: 'The Namespace K8s ')
    string(name: 'identifier'     , defaultValue: 'xxxxxxx'           , description: 'The Namespace K8s ')


  }

     environment ('Set Variable database') {
        // variabili per identificare l'autonomous 
        steps {
                script {    
                        compartmentid=sh (script: "/usr/local/bin/oci  --config-file /home/jenkins/.oci/config search resource free-text-search --text  \"${params.AJD_NAME}\" --raw-output --query \\"data.items[0]\\" |awk -F \\" '{ if ($2==\\"compartment-id\\") print $4}'")
                        identifier   =sh (script: "/usr/local/bin/oci  --config-file /home/jenkins/.oci/config search resource free-text-search --text  \"${params.AJD_NAME}\" --raw-output --query \"data.items[0].identifier\"")                            
                }
        }
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
                echo "AJD compartmentid ${params.compartmentid}"
                echo "AJD identifier is ${params.identifier}"
                echo "AJD dbname is ${params.dbname}"
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
                timeout(time: 600, unit: 'SECONDS') {
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
        stage('Build docker image') {
            steps {
                sh "cp dbwallet.zip json-in-db-master/WineDemo"
                sh "sudo docker build -t eu-frankfurt-1.ocir.io/emeaseitalysandbox/windemo:1 json-in-db-master/WineDemo/. "
                sh "sudo docker login -u 'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com' -p 'uASDz34:E0c)4i0uh{m]' eu-frankfurt-1.ocir.io"  
            } 
        }
                
        stage('Push Oracle Docker Registry') {
            steps {
                sh "sudo docker tag eu-frankfurt-1.ocir.io/emeaseitalysandbox/windemo:1 eu-frankfurt-1.ocir.io/emeaseitalysandbox/winedemo:last"
                sh 'sudo docker push eu-frankfurt-1.ocir.io/emeaseitalysandbox/winedemo:last'
            }    
        } 

        stage('K8s deploy Wine App ') {
        /* This stage builds the actual image; synonymous to  docker build on the command line */
            steps {
                sh 'sudo runuser -l opc -c "kubectl apply -f /var/lib/jenkins/workspace/wine_demo_master/namespace.yaml"'
                sh 'sudo runuser -l opc -c "kubectl create secret docker-registry secret --docker-server=eu-frankfurt-1.ocir.io --docker-username=\'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com\' --docker-password=\'uASDz34:E0c)4i0uh{m]\' --docker-email=\'a@b.com\' --namespace=namespace-winedemo"'
                sh 'sudo runuser -l opc -c "sudo docker login -u \'emeaseitalysandbox/oracleidentitycloud/luca.bindi@oracle.com\' -p \'uASDz34:E0c)4i0uh{m]\' eu-frankfurt-1.ocir.io "'
                sh 'sudo runuser -l opc -c "kubectl apply -f /var/lib/jenkins/workspace/wine_demo_master/oke_deployment.yaml"'
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
                script {
                            def LB_IP = """${sh(
                                            script: 'sudo runuser -l opc -c "kubectl get services --namespace=namespace-winedemo |grep \'winedemo\' | awk \'{print \$4}\'"'                         
                                            ,returnStdout: true 
                                        )}""" 
                            println "WineDemo loadbalance ip : " +   LB_IP 
                         }
            }    
        } 
    }
}     
//kubectl delete -f /var/lib/jenkins/workspace/wine_demo_master/namespace.yaml
//kubectl delete -f /var/lib/jenkins/workspace/wine_demo_master/oke_deployment.yaml   
//kubectl delete secret secret --namespace=namespace-winedemo
//kubectl get pods --namespace=namespace-winedemo
//kubectl describe pods  $(kubectl get pods --namespace=namespace-winedemo|grep wine|awk '{print $1}') --namespace=namespace-winedemo