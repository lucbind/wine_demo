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
