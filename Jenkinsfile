pipeline {
    agent any

    environment {
        BUILD_DIR = 'dist'          
        REMOTE_PATH = '/var/www/html'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Deploy') {
            steps {
                 sh "sudo cp -r ${BUILD_DIR}/* ${REMOTE_PATH}/"
            }
        }
    }
}