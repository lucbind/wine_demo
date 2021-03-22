pipeline {
    agent any 
     environment ('Set Variable database') {
        // variabili per identificare l'autonomous  
        dbname="JSONATTACK"     
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
                environment { 
                      identifier_clone = """${sh(
                                            returnStdout: true,
                                             script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config search resource free-text-search --text ${dbname}01 --raw-output --query  "data.items[0].identifier"' 
                                        )}"""
                } 
            steps {
                script {
                    echo "${identifier_clone}"
                    if (!identifier_clone?.trim()) {
                         //#cloniamo 
                        echo "Create clone because it is not exist "
                        sh '''/usr/local/bin/oci  --config-file /home/jenkins/.oci/config  db autonomous-database create-from-clone --compartment-id ${compartmentid} --db-name ${dbname}01 --cpu-core-count 1 --source-id ${identifier} --clone-type full --admin-password DataBase##11 --data-storage-size-in-tbs 2 --is-auto-scaling-enabled true --display-name CLONEJENK --license-model LICENSE_INCLUDED'''
                    } else {
                        echo "Clone exist  not execute cloning task"
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
                      corret_status=1
                }
                        // 10 minuti  
                steps {
               // timeout(time: 600, unit: 'SECONDS') {
                timeout(time: 30, unit: 'SECONDS') {

                        waitUntil {
                            script {
                            def status = """${sh(
                                            returnStdout: true,
                                            script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config db autonomous-database get --autonomous-database-id ${identifier_clone} --raw-output --query \"data\"|awk -F \\" \'{ if ($2==\"lifecycle-state\") if ($4==\"AVAILABLE\")  print 1 ; else  print 0}\''                           
                                        )}"""      
                            println "Waiting for clone AJD in status AVAILABLE but it is : ->  " + status +"  <-"
                            return  (status == corret_status);
                         }
                        }
                }                      
                script {
                    sh '''/usr/local/bin/oci --config-file /home/jenkins/.oci/config db autonomous-database generate-wallet --file dbwallet.zip --password DataBase##11 --autonomous-database-id  ${identifier_clone}'''
                    }
                }  
        }     
               
        stage('Build docker image') {
        /* This stage builds the actual image; synonymous to  docker build on the command line */
            steps {
            sh "cp dbwallet.zip json-in-db-master/WineDemo"
            sh "sudo docker build json-in-db-master/WineDemo/. -t windemo:1"
            //sh "docker build /var/lib/jenkins/workspace/wine_demo_master/json-in-db-master/WineDemo/. -t windemo:1"
            }    
        } 
    }
}       
