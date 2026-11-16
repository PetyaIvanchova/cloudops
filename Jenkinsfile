
pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:${env.PATH}"
        IMAGE_NAME = "petyaivanchova/cloudops-api"
        EC2_HOST = "13.53.41.22"
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


stage('Deploy to EC2') {
    steps {
        sshagent(credentials: ['ec2-ssh-key']) {
            sh '''
                ssh -o StrictHostKeyChecking=yes \
                    ec2-user@"$EC2_HOST" \
                    "IMAGE_NAME='$IMAGE_NAME' BUILD_NUMBER='$BUILD_NUMBER' bash -s" <<'REMOTE'
set -e

IMAGE="$IMAGE_NAME:$BUILD_NUMBER"

echo "Pulling $IMAGE"
docker pull "$IMAGE"

echo "Stopping old container"
docker stop cloudops-api || true
docker rm cloudops-api || true

echo "Starting new container"
docker run -d \
    --name cloudops-api \
    --restart unless-stopped \
    -p 3000:3000 \
    "$IMAGE"

echo "Checking application health"
for i in 1 2 3 4 5; do
    if curl -fsS http://localhost:3000/health; then
        echo "Deployment successful!"
        exit 0
    fi
    sleep 3
done

echo "Health check failed"
docker logs --tail 30 cloudops-api
exit 1
REMOTE
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
