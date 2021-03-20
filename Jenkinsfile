pipeline {
    agent any 
     environment ('Set Variable database') {
        // variabili per identificare l'autonomous  
        identifier="ocid1.autonomousdatabase.oc1.eu-frankfurt-1.abtheljserxr32aqe7al6ppxi5kl3vd3zzfftvo34fuk6jogqf6l2t5mxweq"
        dbname="JSONATTACK"     
        compartmentid="""${sh(
                            returnStdout: true,
                            script: '/usr/local/bin/oci  --config-file /home/jenkins/.oci/config search resource free-text-search --text JSON_ATTACK --raw-output --query \'"data.items[0].\\"compartment-id\\"\''
                        )}"""
/*
        identifier="""${sh(
                            returnStdout: true,
                            script: '/usr/local/bin/oci --config-file /home/opc/.oci/config search resource free-text-search --text JSON_ATTACK --raw-output --query "data.items[?contains(\"resource-type\", \'AutonomousDatabase\')].\"identifier\"|[0]"'
                        )}"""                            
*/
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
            steps {
                //#cloniamo 
                echo "cloning"
                //sh "/usr/local/bin/oci  --config-file /home/jenkins/.oci/config  db autonomous-database create-from-clone --compartment-id $compartmentid --db-name ${dbname}01 --cpu-core-count 1 --source-id $identifier --clone-type full --admin-password DataBase##11 --data-storage-size-in-tbs 2 --is-auto-scaling-enabled true --license-model LICENSE_INCLUDED"
            }    
        }

       
        stage('Get Wallet') {       
                    /*      
                    // 5 minuti
                    timeout(time: 300, unit: 'SECONDS') {
                        waitUntil {
                            def status = sh(returnStdout: true, script: sh '/usr/local/bin/oci --config-file /home/jenkins/.oci/config db autonomous-database get --autonomous-database-id $identifier_clone --raw-output --query \"data.\"lifecycle-state\"')
                            status == "AVAILABLE"
                         }
                         //
                    } */   
                environment { 
                      identifier_clone = """${sh(
                                            returnStdout: true,
                                             script: '/usr/local/bin/oci --config-file /home/jenkins/.oci/config search resource free-text-search --text ${dbname}01 --raw-output --query  "data.items[0].identifier"' 
                                        )}"""
                }
                steps {
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
