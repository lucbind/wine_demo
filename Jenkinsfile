pipeline {
    agent any 
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
        //oci db autonomous-database create-from-clone --compartment-id $compartmentid --db-name ${dbname}01 --cpu-core-count 1 --source-id $identifier --clone-type full --admin-password DataBase##11 --data-storage-size-in-tbs 2 --is-auto-scaling-enabled true --license-model LICENSE_INCLUDED
            }    
        }
                 

/*        stage('Get Wallet') {
             when {
                   status_clone="""${sh(
                            returnStdout: true,
                            script: 'oci db autonomous-database get --autonomous-database-id $identifier_clone --raw-output --query "data.\"lifecycle-state\""'
                        )}"""  
                 environment(name: 'status_clone', value: 'AVAILABLE')
                 expression { status_clone== 'AVAILABLE' }
              }
            steps {
            sh "pwd"                
            sh "oci db autonomous-database generate-wallet --autonomous-database-id $identifier_clone --file dbwallet.zip --password DataBase##11"
            }    
        } 
 */
        stage('Build docker image') {
        /* This stage builds the actual image; synonymous to  docker build on the command line */
            steps {
                //trysd
            sh "pwd"                
            //sh "cd json-in-db-master/WineDemo"
            sh "sudo docker build json-in-db-master/WineDemo/. -t windemo:1"
            //sh "docker build /var/lib/jenkins/workspace/wine_demo_master/json-in-db-master/WineDemo/. -t windemo:1"
            }    
        } 
    }
}       
