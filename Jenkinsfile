
pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:${env.PATH}"
        IMAGE_NAME = "petyaivanchova/cloudops-api"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
    steps {
        sh 'docker build --platform linux/amd64 -t $IMAGE_NAME:$BUILD_NUMBER .'
    }
}

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push "$IMAGE_NAME:$BUILD_NUMBER"
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }
        failure {
            echo 'CI pipeline failed!'
        }
    }
}
